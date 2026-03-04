/**
 * WhatsApp file/document sender utility
 * Used by document generation flow to send generated .docx files
 */

const fs = require('fs');
const path = require('path');
const { getAnyConnection } = require('./connection');

/**
 * Send a document file to a WhatsApp chat
 */
async function sendDocumentToChat(jid, filePath, fileName) {
  try {
    const sock = await getAnyConnection();
    if (!sock) throw new Error('No active WhatsApp connection');

    const fileBuffer = fs.readFileSync(filePath);
    
    await sock.sendMessage(jid, {
      document: fileBuffer,
      fileName: fileName || path.basename(filePath),
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      caption: `📄 *${fileName || path.basename(filePath)}*\n\n_Documento generado por Gurú Soluciones_`
    });

    console.log(`[Sender] ✅ Document sent to ${jid}: ${fileName}`);
    return true;
  } catch (err) {
    console.error(`[Sender] ❌ Failed to send document:`, err.message);
    throw err;
  }
}

/**
 * Send an image file to a WhatsApp chat
 */
async function sendImageToChat(jid, filePath, caption = '') {
  const sock = await getAnyConnection();
  if (!sock) throw new Error('No active WhatsApp connection');

  const fileBuffer = fs.readFileSync(filePath);
  await sock.sendMessage(jid, {
    image: fileBuffer,
    caption,
  });
}

module.exports = { sendDocumentToChat, sendImageToChat };
