const DocumentRequest = require('../../models/DocumentRequest');
const ClientMedia = require('../../models/ClientMedia');
const { transitionTo, updateData } = require('../stateManager');
const { MSG, LIST } = require('../messages');
const { withList } = require('../../whatsapp/interactive');

function selectTemplate(data) {
  const { vehicleType, paymentType, partyType } = data;

  if (vehicleType === 'embarcacion') return 'ACTO DE VENTA DE EMBARCACION PESQUERA - BARCO';
  if (vehicleType === 'ganado') return 'ACTO DE VENTA DE GANADO BAJO FIRMA PRIVADA - CABALLO';
  if (vehicleType === 'maquinaria') return 'CONTRATO DE VENTA DE MAQUINARIA INDUSTRIAL';

  // vehículo de motor
  if (paymentType === 'permuta') return 'CONTRATO DE PERMUTA DE VEHICULO';
  if (paymentType === 'fondos') return 'ADENDUM SUMINISTRO DE FONDOS ACTO DE VENTA VEHICULO';
  if (partyType === 'apoderado') return 'ACTO DE VENTA DE VEHICULO - CON APODERADO';
  if (paymentType === 'fehaciente') return 'ACTO DE VENTA DE VEHICULO - CON PRUEBA FEHACIENTE DE PAGO';

  return 'ACTO DE VENTA DE VEHICULO'; // standard
}

function parsePrice(raw) {
  const cleaned = String(raw).replace(/[^0-9]/g, '');
  return cleaned ? Number(cleaned) : 0;
}

// Determine which cedula step to go to after dimensions 2 & 3 are collected
function firstCedulaStep(partyType) {
  if (partyType === '2_parties') return 'collect_cedula_vendedor';
  if (partyType === 'apoderado') return 'collect_cedula_represented';
  if (partyType === 'third_party') return 'collect_cedula_vendedor_3p';
  return 'collect_cedula_vendedor';
}

function firstCedulaMessage(session) {
  const partyType = session.data.partyType;
  if (partyType === 'apoderado') {
    const otherParty = session.data.apoderadoRole === 'vendedor' ? 'comprador' : 'vendedor';
    return MSG.VEHICLE_SALE_COLLECT_CEDULA(otherParty);
  }
  return MSG.VEHICLE_SALE_COLLECT_CEDULA('vendedor');
}

async function handle(session, text, msg, savedMedia = null) {
  const step = session.step;

  switch (step) {
    // ── Dimension 1: Partes ──

    case 'ask_parties': {
      const choice = text.trim();
      if (choice === '2_parties') {
        await updateData(session, { partyType: '2_parties', cedulas: [], poder: null });
        await transitionTo(session, 'vehicle_sale', 'ask_vehicle_type', { ...session.data, partyType: '2_parties', cedulas: [], poder: null });
        return withList(MSG.VEHICLE_SALE_ASK_VEHICLE_TYPE, LIST.VEHICLE_SALE_VEHICLE_TYPE);
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

    case 'ask_apoderado_role': {
      const choice = text.trim();
      if (choice !== 'vendedor' && choice !== 'comprador') {
        return withList(MSG.VEHICLE_SALE_ASK_APODERADO_ROLE, LIST.VEHICLE_SALE_APODERADO_ROLE);
      }
      await updateData(session, { apoderadoRole: choice });
      await transitionTo(session, 'vehicle_sale', 'ask_vehicle_type', { ...session.data, apoderadoRole: choice });
      return withList(MSG.VEHICLE_SALE_ASK_VEHICLE_TYPE, LIST.VEHICLE_SALE_VEHICLE_TYPE);
    }

    case 'ask_third_role': {
      const role = text.trim();
      if (role.length < 2) {
        return MSG.VEHICLE_SALE_ASK_THIRD_ROLE;
      }
      await updateData(session, { thirdPartyRole: role });
      await transitionTo(session, 'vehicle_sale', 'ask_vehicle_type', { ...session.data, thirdPartyRole: role });
      return withList(MSG.VEHICLE_SALE_ASK_VEHICLE_TYPE, LIST.VEHICLE_SALE_VEHICLE_TYPE);
    }

    // ── Dimension 2: Tipo de vehículo ──

    case 'ask_vehicle_type': {
      const choice = text.trim();
      if (!['motor', 'embarcacion', 'ganado', 'maquinaria'].includes(choice)) {
        return withList(MSG.VEHICLE_SALE_ASK_VEHICLE_TYPE, LIST.VEHICLE_SALE_VEHICLE_TYPE);
      }
      await updateData(session, { vehicleType: choice });
      await transitionTo(session, 'vehicle_sale', 'ask_price', { ...session.data, vehicleType: choice });
      return MSG.VEHICLE_SALE_ASK_PRICE;
    }

    // ── Dimension 3: Precio + Forma de pago ──

    case 'ask_price': {
      const raw = text.trim();
      if (!raw || parsePrice(raw) === 0) {
        return MSG.VEHICLE_SALE_ASK_PRICE;
      }
      await updateData(session, { precio: raw });
      await transitionTo(session, 'vehicle_sale', 'ask_payment_type', { ...session.data, precio: raw });
      return withList(MSG.VEHICLE_SALE_ASK_PAYMENT, LIST.VEHICLE_SALE_PAYMENT_TYPE);
    }

    case 'ask_payment_type': {
      const choice = text.trim();
      if (!['standard', 'fehaciente', 'fondos', 'permuta'].includes(choice)) {
        return withList(MSG.VEHICLE_SALE_ASK_PAYMENT, LIST.VEHICLE_SALE_PAYMENT_TYPE);
      }
      await updateData(session, { paymentType: choice });

      // Check Ley 155-17 lavado de activos threshold
      const price = parsePrice(session.data.precio);
      const requiresLavado = price > 500000 && choice !== 'permuta';
      await updateData(session, { requiereAdendumLavado: requiresLavado });

      // Show template selection + lavado warning before cedulas
      const templateName = selectTemplate({ ...session.data, paymentType: choice });
      await updateData(session, { templateName });

      if (requiresLavado) {
        await transitionTo(session, 'vehicle_sale', 'notify_lavado', { ...session.data, paymentType: choice, requiereAdendumLavado: true, templateName });
        return MSG.VEHICLE_SALE_CONFIRM(templateName, true) + '\n\n' + MSG.VEHICLE_SALE_LAVADO_WARNING;
      }

      const nextStep = firstCedulaStep(session.data.partyType);
      await transitionTo(session, 'vehicle_sale', nextStep, { ...session.data, paymentType: choice, requiereAdendumLavado: false, templateName });
      return MSG.VEHICLE_SALE_CONFIRM(templateName, false) + '\n\n' + firstCedulaMessage(session);
    }

    // ── Lavado de activos notification (auto-continue) ──

    case 'notify_lavado': {
      // Any reply from user continues to cedula collection
      const nextStep = firstCedulaStep(session.data.partyType);
      await transitionTo(session, 'vehicle_sale', nextStep, session.data);
      return firstCedulaMessage(session);
    }

    // ── 2-party cedula collection ──

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

    // ── Apoderado cedula + poder collection ──

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

    // ── Third-party cedula collection ──

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
      await transitionTo(session, 'vehicle_sale', 'ask_parties', { partyType: null, apoderadoRole: null, thirdPartyRole: null, cedulas: [], poder: null, vehicleType: null, paymentType: null, precio: null, requiereAdendumLavado: false, templateName: null });
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

  const templateName = data.templateName || selectTemplate(data);
  const hasLavado = data.requiereAdendumLavado || false;

  const header = `📋 *Contrato:* ${templateName}\n` +
    (hasLavado ? '⚠️ Incluye Adendum de Declaración de Origen de Fondos (Ley 155-17)\n' : '') +
    '\n✅ *Documentos recibidos:*\n' +
    parts.join('\n') +
    '\n\nUn abogado revisará los documentos y se pondrá en contacto con usted.';

  return header;
}

module.exports = { handle, selectTemplate };
