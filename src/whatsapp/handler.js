const Message = require('../models/Message');
const Client = require('../models/Client');
const ClientMedia = require('../models/ClientMedia');
const { saveMediaFromMessage } = require('./mediaService');
const { routeMessage } = require('../conversation/router');
const { load: loadSettings, save: saveSettings } = require('./botSettings');
const config = require('../config');

// Load persisted settings on startup
const saved = loadSettings();

let botActive = saved.botActive;
let botMode = saved.botMode;
const enabledPhones = new Set(saved.enabledPhones);
const manualPhones = new Set(saved.manualPhones);

console.log(`[WA] Bot state restored: active=${botActive}, mode=${botMode}, enabled=${enabledPhones.size}, manual=${manualPhones.size}`);

// Strip @s.whatsapp.net or @lid suffixes from phone numbers
function normalizePhone(phone) {
  return phone.replace(/@s\.whatsapp\.net$|@lid$/g, '');
}

function persist() {
  saveSettings({
    botActive,
    botMode,
    enabledPhones: [...enabledPhones],
    manualPhones: [...manualPhones],
  });
}

function setBotActive(active) {
  botActive = active;
  console.log(`[WA] Bot ${active ? 'RESUMED' : 'PAUSED'}`);
  persist();
}

function isBotActive() {
  return botActive;
}

function setBotMode(mode) {
  if (mode !== 'all' && mode !== 'selected') return;
  botMode = mode;
  enabledPhones.clear();
  console.log(`[WA] Bot mode set to: ${mode} (enabled list cleared)`);
  persist();
}

function getBotMode() {
  return botMode;
}

// --- Chat enable/disable (selected mode) ---

function setChatEnabled(phone, enabled) {
  const clean = normalizePhone(phone);
  if (enabled) {
    enabledPhones.add(clean);
  } else {
    enabledPhones.delete(clean);
  }
  console.log(`[WA] Phone ${clean}: chat ${enabled ? 'ENABLED' : 'DISABLED'}`);
  persist();
}

function isChatEnabled(phone) {
  if (botMode === 'all') return true;
  return enabledPhones.has(phone);
}

function getEnabledPhones() {
  return [...enabledPhones];
}

// --- Manual mode (agent takeover) ---

function setManualMode(phone, manual) {
  const clean = normalizePhone(phone);
  if (manual) {
    manualPhones.add(clean);
  } else {
    manualPhones.delete(clean);
  }
  console.log(`[WA] Phone ${clean}: ${manual ? 'MANUAL (agent)' : 'BOT mode'}`);
  persist();
}

function isManualMode(phone) {
  return manualPhones.has(phone);
}

function getManualPhones() {
  return [...manualPhones];
}

// Determine if bot should respond to a specific phone
function shouldBotRespond(phone) {
  if (!botActive) return false;
  if (botMode === 'selected' && !enabledPhones.has(phone)) return false;
  if (manualPhones.has(phone)) return false;
  return true;
}

async function handleIncomingMessage(msg, sock) {
  try {
    const remoteJid = msg.key.remoteJid;

    // Skip group messages and status broadcasts
    if (remoteJid.endsWith('@g.us') || remoteJid === 'status@broadcast') return;

    const phone = remoteJid.replace(/@s\.whatsapp\.net$|@lid$/g, '');
    let text = msg.message?.conversation
      || msg.message?.extendedTextMessage?.text
      || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId
      || '';

    // Allow empty text only if there's media (document flow)
    const hasMedia = !!(
      msg.message?.imageMessage
      || msg.message?.documentMessage
      || msg.message?.audioMessage
      || msg.message?.videoMessage
    );

    if (!text && !hasMedia) return;

    const willRespond = shouldBotRespond(phone);
    const tag = !botActive ? '[PAUSED] '
      : manualPhones.has(phone) ? '[MANUAL] '
      : (botMode === 'selected' && !enabledPhones.has(phone)) ? '[INACTIVE] '
      : '';
    console.log(`[WA] ${tag}Mensaje de ${phone}: ${(text || '[media]').substring(0, 100)}`);

    // Always log inbound messages
    let client = await Client.findByPhone(phone);

    // Auto-save media (regardless of bot state — never lose client files)
    let savedMedia = null;
    if (hasMedia) {
      try {
        const mediaResult = await saveMediaFromMessage(msg, phone);
        if (mediaResult) {
          savedMedia = await ClientMedia.create({
            phone,
            clientId: client?.id || null,
            waMessageId: msg.key.id,
            mediaType: mediaResult.mediaType,
            mimeType: mediaResult.mimeType,
            originalName: mediaResult.fileName,
            savedName: mediaResult.savedName,
            filePath: mediaResult.filePath,
            fileSize: mediaResult.fileSize,
            context: 'conversation',
          });
        }
      } catch (mediaErr) {
        console.error('[WA] Error saving media:', mediaErr.message);
      }
    }

    // Analyze media with Gemini (transcribe voice notes, analyze documents)
    // Note: savedMedia is a DB row with snake_case columns (file_path, media_type, mime_type)
    if (savedMedia && config.gemini.enabled) {
      try {
        const { transcribeAudio, analyzeDocument } = require('../llm/mediaAnalysis');

        if (savedMedia.media_type === 'audio') {
          const transcription = await transcribeAudio(savedMedia.file_path, savedMedia.mime_type);
          if (transcription) {
            console.log(`[WA] Voice note transcribed: "${transcription.substring(0, 80)}..."`);
            text = transcription;
          }
        } else if (['image', 'document'].includes(savedMedia.media_type)) {
          const analysis = await analyzeDocument(savedMedia.file_path, savedMedia.mime_type, savedMedia.media_type);
          if (analysis) {
            savedMedia.analysis = analysis;
          }
        }
      } catch (err) {
        console.error('[WA] Media analysis error:', err.message);
      }
    }

    // Determine what to log for this message
    let logContent = text || '[archivo adjunto]';
    if (savedMedia?.media_type === 'audio' && text) {
      logContent = `[🎤 Nota de voz] ${text}`;
    } else if (savedMedia?.analysis) {
      logContent = text ? `${text}\n\n[📄 ${savedMedia.media_type === 'image' ? 'Imagen' : 'Documento'} analizado]` : `[📄 ${savedMedia.media_type === 'image' ? 'Imagen' : 'Documento'} analizado]`;
    }

    const inboundMsg = await Message.create({
      waMessageId: msg.key.id,
      phone,
      clientId: client?.id || null,
      direction: 'inbound',
      content: logContent,
      mediaUrl: savedMedia ? `/api/media/${savedMedia.id}/download` : null,
    });

    // If bot shouldn't respond to this phone, stop here
    if (!willRespond) return;

    // Route through conversation engine
    const response = await routeMessage(phone, text, msg, savedMedia);

    // Re-check client — intake flow may have created one during routeMessage
    if (!client) {
      client = await Client.findByPhone(phone);
      if (client) {
        await Message.linkToClient(inboundMsg.id, client.id);
      }
    }

    if (response) {
      let logContent = typeof response === 'string' ? response : response.text || String(response);

      if (typeof response === 'object' && response.listMessage) {
        // Send interactive list message; fall back to plain text on error
        try {
          await sock.sendMessage(remoteJid, response.listMessage);
        } catch (listErr) {
          console.error('[WA] List message failed, falling back to text:', listErr.message);
          await sock.sendMessage(remoteJid, { text: logContent });
        }
      } else {
        await sock.sendMessage(remoteJid, { text: logContent });
      }

      // Log outbound message
      await Message.create({
        phone,
        clientId: client?.id || null,
        direction: 'outbound',
        content: logContent,
      });
    }
  } catch (err) {
    console.error('[WA] Error procesando mensaje:', err);
    try {
      await sock.sendMessage(msg.key.remoteJid, {
        text: 'Disculpe, ha ocurrido un error en nuestro sistema. Por favor, intente nuevamente en unos momentos.',
      });
    } catch (sendErr) {
      console.error('[WA] Error enviando mensaje de error:', sendErr);
    }
  }
}

module.exports = {
  handleIncomingMessage,
  setBotActive, isBotActive,
  setBotMode, getBotMode,
  setChatEnabled, isChatEnabled, getEnabledPhones,
  setManualMode, isManualMode, getManualPhones,
  shouldBotRespond,
};
