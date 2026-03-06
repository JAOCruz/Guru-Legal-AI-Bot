const DocumentRequest = require('../../models/DocumentRequest');
const ClientMedia = require('../../models/ClientMedia');
const { transitionTo, updateData } = require('../stateManager');
const { MSG, LIST } = require('../messages');
const { withList } = require('../../whatsapp/interactive');

async function handle(session, text, msg, savedMedia = null) {
  const step = session.step;

  switch (step) {
    case 'ask_parties': {
      const choice = text.trim();
      if (choice === '2_parties') {
        await updateData(session, { partyType: '2_parties', cedulas: [], poder: null });
        await transitionTo(session, 'vehicle_sale', 'collect_cedula_vendedor', { ...session.data, partyType: '2_parties', cedulas: [], poder: null });
        return MSG.VEHICLE_SALE_COLLECT_CEDULA('vendedor');
      }
      if (choice === 'apoderado') {
        await updateData(session, { partyType: 'apoderado', cedulas: [], poder: null });
        await transitionTo(session, 'vehicle_sale', 'ask_apoderado_role', { ...session.data, partyType: 'apoderado', cedulas: [], poder: null });
        return withList(MSG.VEHICLE_SALE_ASK_APODERADO_ROLE, LIST.VEHICLE_SALE_APODERADO_ROLE);
      }
      if (choice === 'third_party') {
        await updateData(session, { partyType: 'third_party', cedulas: [], poder: null });
        await transitionTo(session, 'vehicle_sale', 'ask_third_role', { ...session.data, partyType: 'third_party', cedulas: [], poder: null });
        return MSG.VEHICLE_SALE_ASK_THIRD_ROLE;
      }
      return withList(MSG.VEHICLE_SALE_ASK_PARTIES, LIST.VEHICLE_SALE_PARTY_COUNT);
    }

    // ── 2-party flow ──

    case 'collect_cedula_vendedor': {
      const media = extractMedia(msg);
      if (!media) return MSG.DOCUMENT_INVALID_FILE;

      const cedula = await saveCedula(session, media, savedMedia, 'vendedor');
      const cedulas = [...(session.data.cedulas || []), cedula];
      await updateData(session, { cedulas });
      await transitionTo(session, 'vehicle_sale', 'collect_cedula_comprador', { ...session.data, cedulas });
      return MSG.VEHICLE_SALE_COLLECT_CEDULA('comprador');
    }

    case 'collect_cedula_comprador': {
      const media = extractMedia(msg);
      if (!media) return MSG.DOCUMENT_INVALID_FILE;

      const cedula = await saveCedula(session, media, savedMedia, 'comprador');
      const cedulas = [...(session.data.cedulas || []), cedula];
      await updateData(session, { cedulas });
      await transitionTo(session, 'vehicle_sale', 'confirm', { ...session.data, cedulas });
      return buildConfirmation(session.data, cedulas);
    }

    // ── Apoderado flow ──

    case 'ask_apoderado_role': {
      const choice = text.trim();
      if (choice !== 'vendedor' && choice !== 'comprador') {
        return withList(MSG.VEHICLE_SALE_ASK_APODERADO_ROLE, LIST.VEHICLE_SALE_APODERADO_ROLE);
      }
      await updateData(session, { apoderadoRole: choice });
      const otherParty = choice === 'vendedor' ? 'comprador' : 'vendedor';
      await transitionTo(session, 'vehicle_sale', 'collect_cedula_represented', { ...session.data, apoderadoRole: choice });
      return MSG.VEHICLE_SALE_COLLECT_CEDULA(otherParty);
    }

    case 'collect_cedula_represented': {
      const media = extractMedia(msg);
      if (!media) return MSG.DOCUMENT_INVALID_FILE;

      const otherParty = session.data.apoderadoRole === 'vendedor' ? 'comprador' : 'vendedor';
      const cedula = await saveCedula(session, media, savedMedia, otherParty);
      const cedulas = [...(session.data.cedulas || []), cedula];
      await updateData(session, { cedulas });
      await transitionTo(session, 'vehicle_sale', 'collect_cedula_apoderado', { ...session.data, cedulas });
      return MSG.VEHICLE_SALE_COLLECT_CEDULA('apoderado');
    }

    case 'collect_cedula_apoderado': {
      const media = extractMedia(msg);
      if (!media) return MSG.DOCUMENT_INVALID_FILE;

      const cedula = await saveCedula(session, media, savedMedia, 'apoderado');
      const cedulas = [...(session.data.cedulas || []), cedula];
      await updateData(session, { cedulas });
      await transitionTo(session, 'vehicle_sale', 'collect_poder', { ...session.data, cedulas });
      return MSG.VEHICLE_SALE_COLLECT_PODER;
    }

    case 'collect_poder': {
      const media = extractMedia(msg);
      if (!media) return MSG.DOCUMENT_INVALID_FILE;

      const poder = await savePoder(session, media, savedMedia);
      await updateData(session, { poder });
      await transitionTo(session, 'vehicle_sale', 'confirm', { ...session.data, poder });
      return buildConfirmation(session.data, session.data.cedulas, poder);
    }

    // ── Third-party flow ──

    case 'ask_third_role': {
      const role = text.trim();
      if (role.length < 2) {
        return MSG.VEHICLE_SALE_ASK_THIRD_ROLE;
      }
      await updateData(session, { thirdPartyRole: role });
      await transitionTo(session, 'vehicle_sale', 'collect_cedula_vendedor_3p', { ...session.data, thirdPartyRole: role });
      return MSG.VEHICLE_SALE_COLLECT_CEDULA('vendedor');
    }

    case 'collect_cedula_vendedor_3p': {
      const media = extractMedia(msg);
      if (!media) return MSG.DOCUMENT_INVALID_FILE;

      const cedula = await saveCedula(session, media, savedMedia, 'vendedor');
      const cedulas = [...(session.data.cedulas || []), cedula];
      await updateData(session, { cedulas });
      await transitionTo(session, 'vehicle_sale', 'collect_cedula_comprador_3p', { ...session.data, cedulas });
      return MSG.VEHICLE_SALE_COLLECT_CEDULA('comprador');
    }

    case 'collect_cedula_comprador_3p': {
      const media = extractMedia(msg);
      if (!media) return MSG.DOCUMENT_INVALID_FILE;

      const cedula = await saveCedula(session, media, savedMedia, 'comprador');
      const cedulas = [...(session.data.cedulas || []), cedula];
      await updateData(session, { cedulas });
      await transitionTo(session, 'vehicle_sale', 'collect_cedula_third_3p', { ...session.data, cedulas });
      return MSG.VEHICLE_SALE_COLLECT_CEDULA(session.data.thirdPartyRole);
    }

    case 'collect_cedula_third_3p': {
      const media = extractMedia(msg);
      if (!media) return MSG.DOCUMENT_INVALID_FILE;

      const cedula = await saveCedula(session, media, savedMedia, session.data.thirdPartyRole);
      const cedulas = [...(session.data.cedulas || []), cedula];
      await updateData(session, { cedulas });
      await transitionTo(session, 'vehicle_sale', 'confirm', { ...session.data, cedulas });
      return buildConfirmation(session.data, cedulas);
    }

    // ── Confirm ──

    case 'confirm': {
      const choice = text.trim();
      if (choice === '1' || choice === 'menu') {
        await transitionTo(session, 'main_menu', 'show', {});
        return withList(MSG.MAIN_MENU, LIST.MAIN_MENU);
      }
      return 'Escriba *"menu"* para regresar al menú principal.';
    }

    default:
      await transitionTo(session, 'vehicle_sale', 'ask_parties', { partyType: null, apoderadoRole: null, thirdPartyRole: null, cedulas: [], poder: null });
      return withList(MSG.VEHICLE_SALE_ASK_PARTIES, LIST.VEHICLE_SALE_PARTY_COUNT);
  }
}

function extractMedia(msg) {
  return msg.message?.imageMessage
    || msg.message?.documentMessage
    || msg.message?.audioMessage
    || msg.message?.videoMessage
    || null;
}

async function saveCedula(session, mediaMessage, savedMedia, partyLabel) {
  const waMediaId = mediaMessage.mediaKey ? session._lastMsgKey || null : null;
  const fileName = mediaMessage.fileName || `cedula_${partyLabel}_${Date.now()}`;
  const mimeType = mediaMessage.mimetype || 'application/octet-stream';

  const docReq = await DocumentRequest.create({
    clientId: session.client_id,
    caseId: null,
    docType: `Cédula - ${partyLabel}`,
    description: `Cédula de identidad del ${partyLabel} (acto de venta de vehículo)`,
    waMediaId,
    fileName,
    mimeType,
    filePath: savedMedia?.file_path || null,
    mediaId: savedMedia?.id || null,
  });

  if (savedMedia) {
    await ClientMedia.linkToDocRequest(savedMedia.id, docReq.id);
  }

  return { party: partyLabel, docId: docReq.id };
}

async function savePoder(session, mediaMessage, savedMedia) {
  const waMediaId = mediaMessage.mediaKey ? session._lastMsgKey || null : null;
  const fileName = mediaMessage.fileName || `poder_notarial_${Date.now()}`;
  const mimeType = mediaMessage.mimetype || 'application/octet-stream';

  const docReq = await DocumentRequest.create({
    clientId: session.client_id,
    caseId: null,
    docType: 'Poder notarial',
    description: 'Poder notarial del apoderado (acto de venta de vehículo)',
    waMediaId,
    fileName,
    mimeType,
    filePath: savedMedia?.file_path || null,
    mediaId: savedMedia?.id || null,
  });

  if (savedMedia) {
    await ClientMedia.linkToDocRequest(savedMedia.id, docReq.id);
  }

  return { docId: docReq.id };
}

function buildConfirmation(data, cedulas, poder = null) {
  const parts = (cedulas || []).map(c => `- Cédula de *${c.party}* (DOC-${c.docId})`);
  if (poder) {
    parts.push(`- Poder notarial (DOC-${poder.docId})`);
  }
  return MSG.VEHICLE_SALE_CONFIRMED(parts);
}

module.exports = { handle };
