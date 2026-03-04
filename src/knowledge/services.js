/**
 * Guru Soluciones — Official Service Catalog & Pricing
 * Source: GURU_PRECIOS_OFICIALES.pdf (uploaded by Leo, March 2026)
 * All prices in RD$ (Dominican Pesos)
 */

const SERVICE_CATEGORIES = {

  // ═══════════════════════════════════════════════════════
  // LEGAL SERVICES
  // ═══════════════════════════════════════════════════════

  ventas: {
    name: 'Actos de Venta',
    emoji: '🚗',
    legal: true,
    description: 'Contratos de compra-venta de bienes muebles e inmuebles',
    items: [
      // Bajo firma privada
      { name: 'Motocicleta', modalidad: 'bajo_firma', prices: { unico: 200 } },
      { name: 'Vehículo liviano', modalidad: 'bajo_firma', prices: { unico: 250 } },
      { name: 'Cesión de crédito', modalidad: 'bajo_firma', prices: { unico: 250 } },
      { name: 'Nave marítima', modalidad: 'bajo_firma', prices: { unico: 300 } },
      { name: 'Bien inmueble', modalidad: 'bajo_firma', prices: { unico: 300 } },
      { name: 'Venta de terreno', modalidad: 'bajo_firma', prices: { unico: 300 } },
      { name: 'Bien amueblado', modalidad: 'bajo_firma', prices: { unico: 350 } },
      { name: 'Punto comercial', modalidad: 'bajo_firma', prices: { unico: 350 } },
      { name: 'Ganado o animal', modalidad: 'bajo_firma', prices: { unico: 400 } },
      { name: 'Vehículo pesado', modalidad: 'bajo_firma', prices: { unico: 400 } },
      { name: 'Máquina industrial', modalidad: 'bajo_firma', prices: { unico: 500 } },
      { name: 'Vehículo condicional', modalidad: 'bajo_firma', prices: { unico: 500 } },
      { name: 'Bien inmueble condicional', modalidad: 'bajo_firma', prices: { unico: 500 } },
      // Auténticos
      { name: 'Compulsa', modalidad: 'autentico', prices: { unico: 250 } },
    ]
  },

  traslativos: {
    name: 'Contratos Traslativos de Propiedad',
    emoji: '🏠',
    legal: true,
    description: 'Bienes inmuebles y muebles registrables',
    items: [
      // Bajo firma privada
      { name: 'Hipoteca inmueble', modalidad: 'bajo_firma', prices: { unico: 350 } },
      { name: 'Permuta', modalidad: 'bajo_firma', prices: { unico: 500 } },
      { name: 'Promesa / Intención de compra', modalidad: 'bajo_firma', prices: { unico: 500 } },
      // Auténticos
      { name: 'Compulsa', modalidad: 'autentico', prices: { unico: 250 } },
      { name: 'Contrato de anticresis', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Aporte en naturaleza', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Contrato de prenda', modalidad: 'autentico', prices: { unico: 500 } },
    ]
  },

  rentas: {
    name: 'Contratos de Renta / Alquiler',
    emoji: '🔑',
    legal: true,
    description: 'Alquiler de inmuebles, vehículos y terrenos',
    items: [
      { name: 'Alquiler inmueble', modalidad: 'bajo_firma', prices: { unico: 300 } },
      { name: 'Renta de vehículo', modalidad: 'bajo_firma', prices: { unico: 300 } },
      { name: 'Renta de terreno', modalidad: 'bajo_firma', prices: { unico: 300 } },
      { name: 'Alquiler amueblado', modalidad: 'bajo_firma', prices: { unico: 400 } },
      { name: 'Punto comercial (alquiler)', modalidad: 'bajo_firma', prices: { unico: 400 } },
      { name: 'Alquiler inmueble condicional', modalidad: 'bajo_firma', prices: { unico: 400 } },
      { name: 'Alquiler terreno condicional', modalidad: 'bajo_firma', prices: { unico: 400 } },
    ]
  },

  acuerdos: {
    name: 'Acuerdos y Contratos Especiales',
    emoji: '🤝',
    legal: true,
    description: 'Pagarés, donaciones, testamentos, empresas',
    items: [
      // Bajo firma privada
      { name: 'Comodato (uso)', modalidad: 'bajo_firma', prices: { unico: 300 } },
      { name: 'Pagaré notarial', modalidad: 'bajo_firma', prices: { unico: 400 } },
      { name: 'Partición amigable', modalidad: 'bajo_firma', prices: { unico: 400 } },
      { name: 'Donación entre vivos', modalidad: 'bajo_firma', prices: { unico: 400 } },
      { name: 'Contrato de prenda (garantía)', modalidad: 'bajo_firma', prices: { unico: 500 } },
      { name: 'Determinación de herederos', modalidad: 'bajo_firma', prices: { unico: 500 } },
      { name: 'Personalizado', modalidad: 'bajo_firma', prices: { unico: 1000 } },
      // Auténticos
      { name: 'Testamento (bienes post mortem)', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Divorcio mutuo (estipulaciones)', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Matrimonio', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Partición amigable', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Acto constitutivo (EIRL, SRL)', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Estatutos sociales entre empresas', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Nómina de presencia', modalidad: 'autentico', prices: { unico: 500 } },
    ]
  },

  poderes: {
    name: 'Poderes y Autorizaciones',
    emoji: '📜',
    legal: true,
    description: 'Poderes notariales y autorizaciones legales',
    items: [
      { name: 'Para depositar documentos', modalidad: 'autentico', prices: { unico: 250 } },
      { name: 'Para realizar pagos o servicios', modalidad: 'autentico', prices: { unico: 250 } },
      { name: 'Guarda y tutela de menor', modalidad: 'autentico', prices: { unico: 300 } },
      { name: 'Viaje de menor', modalidad: 'autentico', prices: { unico: 300 } },
      { name: 'Para venta de propiedades', modalidad: 'autentico', prices: { unico: 400 } },
      { name: 'Cobrar suma de dinero', modalidad: 'autentico', prices: { unico: 400 } },
      { name: 'Para procesos judiciales', modalidad: 'autentico', prices: { unico: 400 } },
      { name: 'Ampliatorio', modalidad: 'autentico', prices: { unico: 400 } },
    ]
  },

  declaraciones: {
    name: 'Declaraciones Juradas',
    emoji: '✍️',
    legal: true,
    description: 'Declaraciones juradas notariales',
    items: [
      { name: 'Unión libre', modalidad: 'autentico', prices: { unico: 250 } },
      { name: 'Soltería', modalidad: 'autentico', prices: { unico: 250 } },
      { name: 'Residencia o domicilio', modalidad: 'autentico', prices: { unico: 250 } },
      { name: 'No convivencia', modalidad: 'autentico', prices: { unico: 250 } },
      { name: 'Mejora const. (Estado dominicano)', modalidad: 'autentico', prices: { unico: 300 } },
      { name: 'Mejora const. (particulares)', modalidad: 'autentico', prices: { unico: 300 } },
      { name: 'Bienes e ingresos', modalidad: 'autentico', prices: { unico: 300 } },
      { name: 'Portador de arma de fuego', modalidad: 'autentico', prices: { unico: 300 } },
      { name: 'Pérdida de certificado de título', modalidad: 'autentico', prices: { unico: 400 } },
      { name: 'Fabricación de trailers', modalidad: 'autentico', prices: { unico: 400 } },
      { name: 'De procedencia (lavado de activos)', modalidad: 'autentico', prices: { unico: 400 } },
      { name: 'Responsabilidad (cambio nombre empresa)', modalidad: 'autentico', prices: { unico: 400 } },
      { name: 'Pérdida de certificado financiero', modalidad: 'autentico', prices: { unico: 400 } },
      { name: 'De propiedad comercial', modalidad: 'autentico', prices: { unico: 400 } },
      { name: 'De conversión de moneda', modalidad: 'autentico', prices: { unico: 500 } },
    ]
  },

  notoriedades: {
    name: 'Notoriedades',
    emoji: '⚖️',
    legal: true,
    description: 'Actos de notoriedad notarial',
    items: [
      { name: 'No convivencia (desvinculación de núcleo)', modalidad: 'autentico', prices: { unico: 400 } },
      { name: 'Conocen al fallecido', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Buena conducta', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Buena conducta (empleado)', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'Manutención parental', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'De no descendencia', modalidad: 'autentico', prices: { unico: 500 } },
      { name: 'De domicilio', modalidad: 'autentico', prices: { unico: 500 } },
    ]
  },

  comprobaciones: {
    name: 'Comprobaciones',
    emoji: '🔍',
    legal: true,
    description: 'Verificación y autenticación de documentos',
    items: [
      { name: 'Comprobación de documentos', modalidad: 'autentico', prices: { unico: 300 } },
      { name: 'Autenticidad de documentos', modalidad: 'autentico', prices: { unico: 300 } },
      { name: 'Comprobación de evento', modalidad: 'autentico', prices: { unico: 300 } },
    ]
  },

  instancias: {
    name: 'Instancias y Solicitudes',
    emoji: '📄',
    legal: true,
    description: 'Solicitudes formales ante instituciones (JCE, DGII, Cancillería, etc.)',
    items: [
      { name: 'Instancia general ante institución', modalidad: 'instancia', prices: { unico: 100 } },
      { name: 'Carta para JCE (acta de nacimiento)', modalidad: 'instancia', prices: { unico: 100 } },
      { name: 'Instancia DGII (duplicado matrícula, etc.)', modalidad: 'instancia', prices: { unico: 100 } },
    ]
  },

  apostilla: {
    name: 'Apostilla en Cancillería',
    emoji: '🌐',
    legal: true,
    description: 'Apostilla de documentos para uso en el extranjero. Servicio INDEPENDIENTE de la elaboración.',
    items: [
      {
        name: 'Apostilla en Cancillería',
        modalidad: 'apostilla',
        desc: 'Por documento. Requisito: documento bien escaneado, sin tachaduras ni borraduras. Se debe indicar el país de destino.',
        prices: { 'por documento': 300 }
      },
    ]
  },

  // ═══════════════════════════════════════════════════════
  // OFFICE SERVICES
  // ═══════════════════════════════════════════════════════

  impresiones: {
    name: 'Impresiones y Copias',
    emoji: '🖨️',
    legal: false,
    items: [
      { name: 'Impresión blanco y negro', prices: { unidad: 5 } },
      { name: 'Impresión a color', prices: { unidad: 15 } },
      { name: 'Fotocopia', prices: { unidad: 5 } },
      { name: 'Escaneo', prices: { unidad: 10 } },
    ]
  },

  mensajeria: {
    name: 'Mensajería',
    emoji: '🏍️',
    legal: false,
    description: 'Entrega de documentos',
    items: [
      { name: 'Mensajería local (Santo Domingo)', prices: { desde: 200 } },
    ]
  },
};

// ─── Formatters ──────────────────────────────────────────────────────────────

function formatPrice(item) {
  return Object.entries(item.prices)
    .map(([k, v]) => k === 'unico' ? `RD$${v}` : `${k}: RD$${v}`)
    .join(', ');
}

function formatModalidad(m) {
  if (m === 'bajo_firma') return 'Bajo firma privada';
  if (m === 'autentico') return 'Auténtico (notarial)';
  if (m === 'instancia') return 'Instancia';
  if (m === 'apostilla') return 'Apostilla';
  return m;
}

function formatCategory(key) {
  const cat = SERVICE_CATEGORIES[key];
  if (!cat) return '';
  let text = `${cat.emoji} *${cat.name}*\n`;
  if (cat.description) text += `_${cat.description}_\n\n`;

  const byModalidad = {};
  for (const item of cat.items) {
    const m = item.modalidad || 'otro';
    if (!byModalidad[m]) byModalidad[m] = [];
    byModalidad[m].push(item);
  }

  for (const [m, items] of Object.entries(byModalidad)) {
    if (Object.keys(byModalidad).length > 1) {
      text += `📌 _${formatModalidad(m)}:_\n`;
    }
    for (const item of items) {
      text += `  • ${item.name}: *${formatPrice(item)}*\n`;
    }
    text += '\n';
  }
  return text;
}

function formatAllCategories() {
  const legalKeys = Object.keys(SERVICE_CATEGORIES).filter(k => SERVICE_CATEGORIES[k].legal);
  const officeKeys = Object.keys(SERVICE_CATEGORIES).filter(k => !SERVICE_CATEGORIES[k].legal);

  let text = `⚖️ *Tarifario de Servicios — Gurú Soluciones*\n\n`;
  text += `Todos los precios en pesos dominicanos (RD$).\n\n`;
  text += `📜 *Servicios Legales:*\n`;

  legalKeys.forEach((key, i) => {
    text += `${i + 1}. ${SERVICE_CATEGORIES[key].emoji} ${SERVICE_CATEGORIES[key].name}\n`;
  });

  text += `\n🏪 *Servicios de Oficina:*\n`;
  officeKeys.forEach((key, i) => {
    text += `${legalKeys.length + i + 1}. ${SERVICE_CATEGORIES[key].emoji} ${SERVICE_CATEGORIES[key].name}\n`;
  });

  text += `\n0️⃣ Regresar al menú principal`;
  text += `\n\nSeleccione un número para ver los precios detallados.`;
  return text;
}

module.exports = { SERVICE_CATEGORIES, formatPrice, formatCategory, formatAllCategories };
