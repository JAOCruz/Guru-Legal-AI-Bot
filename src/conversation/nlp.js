// Spanish NLP — keyword and pattern-based intent detection for DR legal services

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip accents
    .replace(/[^\w\s]/g, '')                             // strip punctuation
    .trim();
}

// ── Intent patterns ──
const INTENT_PATTERNS = {
  greeting: [
    /\b(hola|buenos?\s*dias?|buenas?\s*tardes?|buenas?\s*noches?|saludos?|que\s*tal|hey|klk|dime)\b/,
  ],
  menu: [
    /\b(menu|inicio|principal|regresar|volver|opciones)\b/,
  ],
  intake: [
    /\b(consulta|asesoria|nuevo\s*caso|registrar|necesito\s*ayuda|problema\s*legal|abogado)\b/,
    /\b(demanda|denuncia|quiero\s*demandar|me\s*demandaron|asunto\s*legal)\b/,
  ],
  appointment: [
    /\b(cita|agendar|agenda|programar|horario|disponibilidad|reunion|visita)\b/,
  ],
  certificate: [
    /\b(buena\s*conducta|buena\s*costumbre|certificado\s*de?\s*(buena|antecedente)|antecedentes?\s*penales?|ministerio\s*publico|no\s*antecedentes)\b/,
    /\b(certificado|certificacion)\b.*\b(conducta|costumbre|penal|antecedentes?)\b/,
  ],
  printing: [
    /\b(imprimir|imprimirlo|imprimelo|impresion|imprime|sacar\s*copia|fotocopia|fotocopiar|fotocopialo)\b/,
    /\b(quiero|necesito|puedes?)\b.*\b(imprimir|impresion|copia|fotocopia)\b/,
  ],
  document: [
    /\b(documento|documentos?|archivo|enviar\s*archivo|subir|adjuntar|papel|papeles)\b/,
    /\b(cedula|pasaporte|acta|contrato|poder\s*notarial|comprobante|certificado\s*de\s*titulo)\b/,
    /\b(redaccion|redactar|elaborar\s*documento)\b/,
  ],
  case_status: [
    /\b(estado|estatus|expediente|caso|seguimiento|avance|como\s*va)\b/,
    /\b(consultar\s*caso|mi\s*caso|numero\s*de\s*caso)\b/,
  ],
  legal_info: [
    /\b(informacion\s*legal|ley|leyes|codigo|articulo|legislacion)\b/,
    /\b(interdiccion|concubinato|poder\s*notarial|notoriedad|anticresis|prenda)\b/,
    /\b(divorcio|venta\s*inmueble|venta\s*vehiculo|notificacion\s*legal|citacion)\b/,
    /\b(que\s*dice\s*la\s*ley|base\s*legal|fundamento|marco\s*legal)\b/,
    /\b(institucion|gobierno|dgii|jce|catastro|registro\s*inmobiliario|migracion)\b/,
  ],
  services: [
    /\b(servicio|servicios|precio|precios|tarifa|tarifario|costo|cuanto\s*cuesta|cuanto\s*vale)\b/,
    /\b(fotocopia|impresion|impresiones|diseno|materiales|oficina)\b/,
  ],
  talk_to_lawyer: [
    /\b(hablar|comunicar|contactar|llamar|asesor|licenciado)\b/,
    /\b(persona\s*real|humano|atencion\s*personal)\b/,
  ],
  urgent: [
    /\b(urgente|emergencia|inmediato|ahora\s*mismo|lo\s*antes\s*posible|cuanto\s*antes)\b/,
  ],
  help: [
    /\b(ayuda|help|asistencia|no\s*entiendo|como\s*funciona|instrucciones)\b/,
  ],
  goodbye: [
    /\b(salir|adios|hasta\s*luego|gracias|terminar|finalizar|chao|bye)\b/,
  ],
  confirm_yes: [
    /^(1|si|sí|correcto|confirmo|confirmar|de\s*acuerdo|ok|vale|afirmativo)$/,
  ],
  confirm_no: [
    /^(2|no|incorrecto|cancelar|corregir|cambiar|negativo)$/,
  ],
  skip: [
    /^(omitir|saltar|skip|no\s*tengo|prefiero\s*no)$/,
  ],
  register: [
    /\b(registrar|registrarme|inscribir|darme\s*de\s*alta|crear\s*cuenta)\b/,
  ],
  casual: [
    /\b(jaja|haha|lol|jejeje|xd|jeje)\b/,
    /^(ok|ah|oh|wow|dale|bien|genial|excelente|perfecto|tranqui|bregamos|listo)$/,
  ],
};

// ── Legal topic detection — Dominican Republic specific ──
const LEGAL_TOPICS = {
  civil: /\b(civil|propiedad|herencia|sucesion|arrendamiento|contrato|deuda|cobro|dano|indemnizacion|interdiccion|anticresis|prenda)\b/,
  penal: /\b(penal|delito|crimen|robo|fraude|lesiones|homicidio|denuncia|ministerio\s*publico|fiscalia|procuraduria|carpeta)\b/,
  familiar: /\b(familiar|familia|divorcio|custodia|pension\s*alimenticia|alimentos|matrimonio|adopcion|guarda|concubinato|union\s*libre)\b/,
  laboral: /\b(laboral|trabajo|despido|liquidacion|prestaciones|patron|empleador|codigo\s*de\s*trabajo|salario|sueldo|ministerio\s*de\s*trabajo)\b/,
  mercantil: /\b(mercantil|sociedad|empresa|comercial|quiebra|registro\s*mercantil|pagare|cheque|letra\s*de\s*cambio)\b/,
  inmobiliario: /\b(inmobiliario|inmueble|titulo|certificado\s*de\s*titulo|registro\s*de\s*titulos|deslinde|catastro|ley\s*108|solar|terreno|apartamento|casa)\b/,
  fiscal: /\b(fiscal|impuesto|dgii|tributario|itbis|isr|contribucion|declaracion|transferencia\s*inmobiliaria)\b/,
  migratorio: /\b(migratorio|migracion|visa|residencia|pasaporte|extranjero|permiso\s*de\s*trabajo|estatus\s*migratorio)\b/,
  notarial: /\b(notarial|notario|acto\s*autentico|fe\s*publica|legalizacion|apostilla|ley\s*140|poder|acto\s*de\s*notoriedad)\b/,
};

function detectIntent(text) {
  const norm = normalize(text);

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(norm)) {
        return intent;
      }
    }
  }
  return 'unknown';
}

function detectLegalTopic(text) {
  const norm = normalize(text);
  for (const [topic, pattern] of Object.entries(LEGAL_TOPICS)) {
    if (pattern.test(norm)) return topic;
  }
  return null;
}

function isMenuChoice(text, maxOption) {
  const num = parseInt(text.trim(), 10);
  if (!isNaN(num) && num >= 0 && num <= maxOption) return num;
  return null;
}

function parseDate(text) {
  // DD/MM/YYYY or DD-MM-YYYY
  const match = text.trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);

  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (date < now) return null;

  return date;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

function formatDateES(date) {
  return date.toLocaleDateString('es-DO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isValidEmail(text) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
}

// Dominican cédula pattern: XXX-XXXXXXX-X (with or without dashes)
const CEDULA_PATTERN = /\b(\d{3})-?(\d{7})-?(\d)\b/;

function extractCedula(text) {
  const match = text.match(CEDULA_PATTERN);
  if (!match) return null;
  return { cedula: `${match[1]}-${match[2]}-${match[3]}`, raw: match[0] };
}

function isEscapeIntent(text) {
  const norm = normalize(text);
  return /\b(no quiero|cancelar|no necesito|no deseo|dejame|dejar|volver al menu|regresar al menu|no gracias|parar|detener|ya no|no me interesa)\b/.test(norm);
}

// ── Direct service detection — maps free text to specific service items ──
const DIRECT_SERVICE_MAP = [
  // Declaraciones Juradas
  { pattern: /\b(union\s*libre|concubin)/,           category: 'declaraciones', item: 'Unión Libre' },
  { pattern: /\b(solteria|soltero|soltera)/,          category: 'declaraciones', item: 'Soltería' },
  { pattern: /\b(residencia|domicilio)\b.*\b(declaracion|jurada)\b|\b(declaracion|jurada)\b.*\b(residencia|domicilio)\b/, category: 'declaraciones', item: 'Residencia o Domicilio' },
  { pattern: /\bno\s*convivencia\b/,                  category: 'declaraciones', item: 'No Convivencia' },
  { pattern: /\bbienes\s*(e|y)\s*ingresos/,           category: 'declaraciones', item: 'Bienes e Ingresos' },
  { pattern: /\bportador\s*de?\s*arma/,               category: 'declaraciones', item: 'Portador de Arma de Fuego' },

  // Contratos de Venta
  { pattern: /\bventa\s*de?\s*moto/,                  category: 'contratos_venta', item: 'Venta Motocicleta' },
  { pattern: /\bventa\s*de?\s*(vehiculo|carro|auto)\s*(liviano)?/, category: 'contratos_venta', item: 'Venta Vehículo Liviano' },
  { pattern: /\bventa\s*de?\s*(vehiculo|carro|camion)\s*pesad/, category: 'contratos_venta', item: 'Venta Vehículo Pesado' },
  { pattern: /\bventa\s*de?\s*(inmueble|casa|apartamento)/, category: 'contratos_venta', item: 'Venta Bien Inmueble' },
  { pattern: /\bventa\s*de?\s*terreno/,               category: 'contratos_venta', item: 'Venta de Terreno' },
  { pattern: /\bventa\s*de?\s*(punto\s*comercial|negocio|colmado)/, category: 'contratos_venta', item: 'Venta Punto Comercial' },

  // Contratos de Renta
  { pattern: /\b(alquiler|renta|arrendamiento)\s*de?\s*(inmueble|casa|apartamento)/, category: 'contratos_renta', item: 'Alquiler Inmueble' },
  { pattern: /\b(alquiler|renta)\s*de?\s*(vehiculo|carro)/, category: 'contratos_renta', item: 'Renta de Vehículo' },

  // Poderes
  { pattern: /\b(autorizacion|permiso)\s*(de\s*)?(viaje|salida)\s*(de\s*)?(menor|nino|hijo)/, category: 'poderes', item: 'Autorización Viaje de Menor' },
  { pattern: /\bpoder\s*(para\s*)?(venta|vender)\s*(de\s*)?(propiedad|inmueble|casa)/, category: 'poderes', item: 'Poder para Venta de Propiedades' },
  { pattern: /\bpoder\s*(para\s*)?(cobr|cobrar)/, category: 'poderes', item: 'Poder para Cobrar Suma de Dinero' },
  { pattern: /\bpoder\s*(para\s*)?(proceso|judicial|tribunal)/, category: 'poderes', item: 'Poder para Procesos Judiciales' },
  { pattern: /\bpoder\s*(para\s*)?(guarda|tutela|custodia)\s*(de\s*)?(menor)?/, category: 'poderes', item: 'Poder para Guarda y Tutela de Menor' },

  // Acuerdos
  { pattern: /\bdivorcio\s*(mutuo)?(\s*consentimiento)?/, category: 'acuerdos', item: 'Divorcio Mutuo Consentimiento' },
  { pattern: /\bmatrimonio\b/,                         category: 'acuerdos', item: 'Matrimonio' },
  { pattern: /\btestamento\b/,                         category: 'acuerdos', item: 'Testamento (Post Mortem)' },
  { pattern: /\bpagare\b/,                             category: 'acuerdos', item: 'Pagaré Notarial' },
  { pattern: /\bdonacion\b/,                           category: 'acuerdos', item: 'Donación entre Vivos' },
  { pattern: /\b(acto\s*constitutivo|eirl|srl)\b/,    category: 'acuerdos', item: 'Acto Constitutivo Empresa (EIRL, SRL)' },
  { pattern: /\bherederos?\b/,                         category: 'acuerdos', item: 'Determinación de Herederos' },

  // Notoriedades
  { pattern: /\bbuena\s*conducta\b/,                   category: 'notoriedades', item: 'Buena Conducta' },
  { pattern: /\bmanutenci[oó]n\s*parental\b/,         category: 'notoriedades', item: 'Manutención Parental' },

  // Servicios Digitales
  { pattern: /\bapostill/,                             category: 'servicios_digitales', item: 'Apostilla en Cancillería' },
  { pattern: /\b(ds.?160|visa\s*(eeuu|americana|usa))/, category: 'servicios_digitales', item: 'Formulario DS-160 (Visa EEUU)' },
  { pattern: /\bpasaporte\b/,                          category: 'servicios_digitales', item: 'Emisión / Renovación Pasaporte' },
  { pattern: /\b(buena\s*costumbre|no\s*antecedentes?\s*penales?)/, category: 'servicios_digitales', item: 'Certificación Buena Costumbre' },

  // Instancias
  { pattern: /\brecurso\s*de?\s*amparo/,               category: 'instancias', item: 'Recurso de Amparo' },
  { pattern: /\brecurso\s*de?\s*apelacion/,            category: 'instancias', item: 'Recurso de Apelación' },

  // Traslativos
  { pattern: /\bhipoteca\b/,                           category: 'contratos_traslativos', item: 'Hipoteca Inmueble' },
  { pattern: /\bpermuta\b/,                            category: 'contratos_traslativos', item: 'Permuta' },
];

function detectDirectService(text) {
  const norm = normalize(text);
  for (const entry of DIRECT_SERVICE_MAP) {
    if (entry.pattern.test(norm)) {
      return { category: entry.category, itemName: entry.item };
    }
  }
  return null;
}

module.exports = {
  normalize,
  detectIntent,
  detectLegalTopic,
  isMenuChoice,
  isEscapeIntent,
  extractCedula,
  parseDate,
  isWeekend,
  formatDateISO,
  formatDateES,
  isValidEmail,
  detectDirectService,
};
