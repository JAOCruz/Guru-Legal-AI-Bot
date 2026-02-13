// Gurú Soluciones — Tarifario Completo de Servicios (Legal + Oficina)
// Precios en RD$ (pesos dominicanos)
// Base legal: Ley 140-15 del Notariado, Ley 126-02 Comercio Electrónico

const SERVICE_CATEGORIES = {
  // ══════════════════════════════════════════
  // SERVICIOS LEGALES (core business)
  // ══════════════════════════════════════════

  contratos_venta: {
    name: 'Contratos de Venta',
    emoji: '📝',
    legal: true,
    items: [
      { name: 'Venta Motocicleta', desc: 'Bajo firma privada', prices: { unico: 200 } },
      { name: 'Venta Vehículo Liviano', desc: 'Bajo firma privada', prices: { unico: 250 } },
      { name: 'Cesión de Crédito', desc: 'Bajo firma privada', prices: { unico: 250 } },
      { name: 'Venta Nave Marítima', desc: 'Bajo firma privada', prices: { unico: 300 } },
      { name: 'Venta Bien Inmueble', desc: 'Bajo firma privada', prices: { unico: 300 } },
      { name: 'Venta de Terreno', desc: 'Bajo firma privada', prices: { unico: 300 } },
      { name: 'Venta Bien Amueblado', desc: 'Bajo firma privada', prices: { unico: 350 } },
      { name: 'Venta Punto Comercial', desc: 'Bajo firma privada', prices: { unico: 350 } },
      { name: 'Venta Ganado o Animal', desc: 'Bajo firma privada', prices: { unico: 400 } },
      { name: 'Venta Vehículo Pesado', desc: 'Bajo firma privada', prices: { unico: 400 } },
      { name: 'Venta Máquina Industrial', desc: 'Bajo firma privada', prices: { unico: 500 } },
      { name: 'Venta Vehículo Condicional', desc: 'Bajo firma privada', prices: { unico: 500 } },
      { name: 'Venta Inmueble Condicional', desc: 'Bajo firma privada', prices: { unico: 500 } },
      { name: 'Compulsa (Acto Auténtico)', desc: 'Auténtico notariado', prices: { unico: 250 } },
    ],
  },

  contratos_traslativos: {
    name: 'Contratos Traslativos de Propiedad',
    emoji: '🏠',
    legal: true,
    items: [
      { name: 'Hipoteca Inmueble', desc: 'Bajo firma privada', prices: { unico: 350 } },
      { name: 'Permuta', desc: 'Bajo firma privada', prices: { unico: 500 } },
      { name: 'Promesa de Compra (Intención)', desc: 'Bajo firma privada', prices: { unico: 500 } },
      { name: 'Compulsa (Acto Auténtico)', desc: 'Auténtico notariado', prices: { unico: 250 } },
      { name: 'Contrato de Anticresis', desc: 'Auténtico', prices: { unico: 500 } },
      { name: 'Aporte en Naturaleza', desc: 'Auténtico', prices: { unico: 500 } },
      { name: 'Contrato de Prenda', desc: 'Auténtico', prices: { unico: 500 } },
    ],
  },

  contratos_renta: {
    name: 'Contratos de Renta / Alquiler',
    emoji: '🏢',
    legal: true,
    items: [
      { name: 'Alquiler Inmueble', desc: 'Bajo firma privada', prices: { unico: 300 } },
      { name: 'Renta de Vehículo', desc: 'Bajo firma privada', prices: { unico: 300 } },
      { name: 'Renta de Terreno', desc: 'Bajo firma privada', prices: { unico: 300 } },
      { name: 'Alquiler Amueblado', desc: 'Bajo firma privada', prices: { unico: 400 } },
      { name: 'Alquiler Punto Comercial', desc: 'Bajo firma privada', prices: { unico: 400 } },
      { name: 'Alquiler Inmueble Condicional', desc: 'Bajo firma privada', prices: { unico: 400 } },
      { name: 'Alquiler Terreno Condicional', desc: 'Bajo firma privada', prices: { unico: 400 } },
    ],
  },

  acuerdos: {
    name: 'Acuerdos y Convenios',
    emoji: '🤝',
    legal: true,
    items: [
      { name: 'Contrato de Comodato (Uso)', desc: 'Bajo firma privada', prices: { unico: 300 } },
      { name: 'Pagaré Notarial', desc: 'Bajo firma privada', prices: { unico: 400 } },
      { name: 'Partición Amigable', desc: 'Bajo firma privada', prices: { unico: 400 } },
      { name: 'Donación entre Vivos', desc: 'Bajo firma privada', prices: { unico: 400 } },
      { name: 'Contrato de Prenda (Garantía)', desc: 'Bajo firma privada', prices: { unico: 500 } },
      { name: 'Determinación de Herederos', desc: 'Bajo firma privada', prices: { unico: 500 } },
      { name: 'Contrato Personalizado', desc: 'Bajo firma privada', prices: { unico: 1000 } },
      { name: 'Testamento (Post Mortem)', desc: 'Auténtico', prices: { unico: 500 } },
      { name: 'Divorcio Mutuo Consentimiento', desc: 'Auténtico - Estipulación y Convenciones', prices: { unico: 500 } },
      { name: 'Matrimonio', desc: 'Auténtico', prices: { unico: 500 } },
      { name: 'Partición Amigable (Auténtico)', desc: 'Auténtico', prices: { unico: 500 } },
      { name: 'Acto Constitutivo Empresa (EIRL, SRL)', desc: 'Auténtico', prices: { unico: 500 } },
      { name: 'Estatutos Sociales entre Empresas', desc: 'Auténtico', prices: { unico: 500 } },
      { name: 'Nómina de Presencia', desc: 'Auténtico', prices: { unico: 500 } },
    ],
  },

  poderes: {
    name: 'Poderes y Autorizaciones',
    emoji: '📜',
    legal: true,
    items: [
      { name: 'Poder para Depositar Documentos', desc: 'Auténtico', prices: { unico: 250 } },
      { name: 'Poder para Realizar Pagos o Servicios', desc: 'Auténtico', prices: { unico: 250 } },
      { name: 'Poder para Guarda y Tutela de Menor', desc: 'Auténtico', prices: { unico: 300 } },
      { name: 'Autorización Viaje de Menor', desc: 'Auténtico', prices: { unico: 300 } },
      { name: 'Poder para Venta de Propiedades', desc: 'Auténtico', prices: { unico: 400 } },
      { name: 'Poder para Cobrar Suma de Dinero', desc: 'Auténtico', prices: { unico: 400 } },
      { name: 'Poder para Procesos Judiciales', desc: 'Auténtico', prices: { unico: 400 } },
      { name: 'Poder Ampliatorio', desc: 'Auténtico', prices: { unico: 400 } },
    ],
  },

  declaraciones: {
    name: 'Declaraciones Juradas',
    emoji: '✋',
    legal: true,
    items: [
      { name: 'Unión Libre', desc: 'Auténtico', prices: { unico: 250 } },
      { name: 'Soltería', desc: 'Auténtico', prices: { unico: 250 } },
      { name: 'Residencia o Domicilio', desc: 'Auténtico', prices: { unico: 250 } },
      { name: 'No Convivencia', desc: 'Auténtico', prices: { unico: 250 } },
      { name: 'Mejora Const. Estado Dominicano', desc: 'Auténtico', prices: { unico: 300 } },
      { name: 'Mejora Const. Particulares', desc: 'Auténtico', prices: { unico: 300 } },
      { name: 'Bienes e Ingresos', desc: 'Auténtico', prices: { unico: 300 } },
      { name: 'Portador de Arma de Fuego', desc: 'Auténtico', prices: { unico: 300 } },
      { name: 'Pérdida de Certificado de Título', desc: 'Auténtico', prices: { unico: 400 } },
      { name: 'Fabricación de Trailers', desc: 'Auténtico', prices: { unico: 400 } },
      { name: 'De Procedencia (Lavado de Activos)', desc: 'Auténtico - Ley 155-17', prices: { unico: 400 } },
      { name: 'Responsabilidad (Cambio Nombre Empresa)', desc: 'Auténtico', prices: { unico: 400 } },
      { name: 'Pérdida Certificado Financiero', desc: 'Auténtico', prices: { unico: 400 } },
      { name: 'Propiedad Comercial', desc: 'Auténtico', prices: { unico: 400 } },
      { name: 'Conversión de Moneda', desc: 'Auténtico', prices: { unico: 500 } },
    ],
  },

  notoriedades: {
    name: 'Actos de Notoriedad',
    emoji: '🔏',
    legal: true,
    items: [
      { name: 'No Convivencia (Desvinculación)', desc: 'Desvinculación de núcleo familiar', prices: { unico: 400 } },
      { name: 'Conocen al Fallecido', desc: 'Acto de notoriedad', prices: { unico: 500 } },
      { name: 'Buena Conducta', desc: 'Acto de notoriedad', prices: { unico: 500 } },
      { name: 'Buena Conducta Empleado', desc: 'Acto de notoriedad', prices: { unico: 500 } },
      { name: 'Manutención Parental', desc: 'Acto de notoriedad', prices: { unico: 500 } },
      { name: 'No Descendencia', desc: 'Acto de notoriedad', prices: { unico: 500 } },
      { name: 'De Domicilio', desc: 'Acto de notoriedad', prices: { unico: 500 } },
    ],
  },

  comprobaciones: {
    name: 'Comprobaciones',
    emoji: '🔍',
    legal: true,
    items: [
      { name: 'Comprobación de Documentos', desc: 'Verificación documental', prices: { unico: 300 } },
      { name: 'Autenticidad de Documentos', desc: 'Verificación de autenticidad', prices: { unico: 300 } },
      { name: 'Comprobación de Evento', desc: 'Verificación de evento', prices: { unico: 300 } },
    ],
  },

  instancias: {
    name: 'Instancias (Solicitudes Formales)',
    emoji: '📄',
    legal: true,
    items: [
      { name: 'Solicitud de Documentos', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Certificaciones', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Levantamiento', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Depósito de Documentos', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Arrendamiento Inmueble', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Desglose Expediente', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Desglose de Pago', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Corrección', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Autorización', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud Fijación de Audiencia', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Pronunciamiento', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud Asignación de Sala', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud Inscripción Nombre Comercial', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Transferencia', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud Prórroga Expediente', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Construcción', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud Recogida de Escombros', desc: 'Estándar', prices: { unico: 150 } },
      { name: 'Solicitud de Oposición', desc: 'Media complejidad', prices: { unico: 200 } },
      { name: 'Solicitud Avalúo de Inmueble', desc: 'Media complejidad', prices: { unico: 200 } },
      { name: 'Solicitud Depósito de Inventario', desc: 'Compleja', prices: { unico: 300 } },
      { name: 'Solicitud Subsanación de Expediente', desc: 'Compleja', prices: { unico: 300 } },
      { name: 'Recurso de Amparo', desc: 'Alta complejidad', prices: { unico: 500 } },
      { name: 'Recurso de Reconsideración', desc: 'Alta complejidad', prices: { unico: 500 } },
      { name: 'Recurso de Apelación', desc: 'Alta complejidad', prices: { unico: 500 } },
      { name: 'Comunicación / Invitación Importante', desc: 'Alta complejidad', prices: { unico: 500 } },
    ],
  },

  servicios_digitales: {
    name: 'Servicios Digitales',
    emoji: '💻',
    legal: true,
    items: [
      { name: 'Apostilla en Cancillería', desc: 'Por documento', prices: { rango: '250 - 300' } },
      { name: 'Formulario DS-160 (Visa EEUU)', desc: 'Por persona', prices: { unico: 2000 } },
      { name: 'Certificación Estatus Jurídico Inmueble', desc: 'No gravamen, por inmueble', prices: { unico: 500 } },
      { name: 'Solicitudes DGII / Tribunales / Poder Judicial', desc: 'Por unidad', prices: { unico: 500 } },
      { name: 'Emisión / Renovación Pasaporte', desc: 'Pasaporte dominicano', prices: { unico: 500 } },
      { name: 'Pagos en Línea Digitales', desc: 'Por unidad', prices: { unico: 500 } },
      { name: 'Certificación Buena Costumbre', desc: 'No antecedentes penales', prices: { unico: 250 } },
      { name: 'Formularios Migración', desc: 'DGM - Por unidad', prices: { rango: '600 - 800' } },
      { name: 'Formularios Aduanas', desc: 'DGA - Por unidad', prices: { unico: 500 } },
    ],
  },

  // ══════════════════════════════════════════
  // SERVICIOS DE OFICINA
  // ══════════════════════════════════════════

  impresiones: {
    name: 'Impresiones y Más',
    emoji: '🖨️',
    items: [
      { name: 'Fotocopia', desc: 'Servicio de fotocopiado', prices: { '8x11': 3, '8x14': 10, '11x17': 25 } },
      { name: 'Impresión Blanco y Negro', desc: 'Impresión monocromática', prices: { '8x11': 10, '8x14': 50, '11x17': 100 } },
      { name: 'Impresión Full Color', desc: 'Impresión a color', prices: { '8x11': 25, '8x14': 75, '11x17': 150 } },
      { name: 'Impresión Lámina Foto', desc: 'Impresión fotográfica en lámina', prices: { '8x11': 40, '8x14': 100, '11x17': 300 } },
      { name: 'Foto 2x2', desc: 'Fotografía tamaño 2x2', prices: { unico: 300 } },
      { name: 'Brochures Papel Satinado', desc: 'Brochures en papel satinado', prices: { '8x11': 70, '8x14': 200 } },
    ],
  },
  avanzados: {
    name: 'Servicios Avanzados',
    emoji: '💼',
    items: [
      { name: 'Tarjetas de Presentación', desc: 'Precio por unidad', prices: { unidad: 5 } },
      { name: 'Diseño Tarjetas de Presentación', desc: 'Servicio de diseño', prices: { unico: 200 } },
      { name: 'Diseño Timbrado', desc: 'Servicio de diseño de timbrado', prices: { unico: 200 } },
      { name: 'Diseño Sello Gomígrafo', desc: 'Servicio de diseño de sello', prices: { unico: 300 } },
      { name: 'Diseño Flyer', desc: 'Servicio de diseño de volante', prices: { unico: 1000 } },
      { name: 'Grabar CD', desc: 'Servicio de grabación en CD', prices: { unico: 100 } },
      { name: 'Análisis o Síntesis Escolar', desc: 'Elaboración de trabajos escolares', prices: { rango: '500 - 1,500' } },
      { name: 'Anti Plagio', desc: 'Verificación anti plagio', prices: { rango: '800 - 1,000' } },
      { name: 'Monográfico Personalizado', desc: 'Elaboración de monográfico completo', prices: { rango: '15,000 - 30,000' } },
    ],
  },
  materiales: {
    name: 'Materiales de Oficina',
    emoji: '📎',
    items: [
      { name: 'Papel Bond 8.5x11 blanco', prices: { unidad: 2, paquete: 5 } },
      { name: 'Papel Cartonite blanco', prices: { '8x11': 10, '8x14': 25, '11x17': 100 } },
      { name: 'Papel Adhesivo Satinado', prices: { '8x11': 20, '8x14': 40, '11x17': 150 } },
      { name: 'Papel Satinado Slim', prices: { '8x11': 8, '8x14': 20, '11x17': 70 } },
      { name: 'Papel Vegetal', prices: { '8x11': 10, '8x14': 40, '11x17': 100 } },
      { name: 'CD virgen', prices: { unico: 50 } },
      { name: 'Folder Manila', prices: { '8x11': 10, '8x14': 25 } },
      { name: 'Sobre Manila', prices: { '8x11': 10, '8x14': 30, '11x17': 50 } },
      { name: 'Folder Multicolor Especial', prices: { '8x11': 25, '8x14': 60 } },
      { name: 'Carpeta Plástica', prices: { '8x11': 100, '8x14': 150, '11x17': 250 } },
      { name: 'Carpeta Plástica Archivo', prices: { '8x11': 250, '8x14': 300 } },
      { name: 'Tabla Pisa Papel', prices: { '8x11': 80, '8x14': 150, '11x17': 300 } },
      { name: 'Bolígrafo', desc: 'Colores variados', prices: { rango: '20 - 50' } },
      { name: 'Lápiz HB 2', prices: { unico: 15 } },
      { name: 'Sacapuntas', prices: { rango: '25 - 50' } },
      { name: 'Liquid Paper (Brocha/Lápiz)', prices: { unico: 100 } },
      { name: 'Tijera Pequeña', prices: { unico: 70 } },
      { name: 'Tijera Grande', prices: { unico: 170 } },
      { name: 'Marcadores Pizarra', prices: { unico: 100 } },
      { name: 'Resaltador Multicolor', prices: { unico: 85 } },
    ],
  },
  comestibles: {
    name: 'Comestibles',
    emoji: '🥤',
    items: [
      { name: 'Galletas de Avena', prices: { unico: 100 } },
      { name: 'Ajonjolí / Maní', prices: { unico: 50 } },
      { name: 'Semilla de Cajuil', prices: { unico: 100 } },
      { name: 'Semilla de Almendra', prices: { unico: 100 } },
      { name: 'Semilla de Pistacho', prices: { unico: 120 } },
      { name: 'Botella de Agua', prices: { unico: 25 } },
      { name: 'Jugo Natural', prices: { unico: 100 } },
      { name: 'Bizcocho de Maní', prices: { unico: 100 } },
    ],
  },
};

function formatPrice(prices) {
  if (prices.rango) return `RD$${prices.rango}`;
  if (prices.unico) return `RD$${prices.unico}`;
  if (prices.unidad) return `RD$${prices.unidad}/u`;
  const parts = [];
  if (prices['8x11']) parts.push(`8.5x11: RD$${prices['8x11']}`);
  if (prices['8x14']) parts.push(`8.5x14: RD$${prices['8x14']}`);
  if (prices['11x17']) parts.push(`11x17: RD$${prices['11x17']}`);
  return parts.join(' | ');
}

function formatCategory(key) {
  const cat = SERVICE_CATEGORIES[key];
  if (!cat) return null;
  let text = `${cat.emoji} *${cat.name}*\n\n`;
  cat.items.forEach(item => {
    text += `• ${item.name}`;
    if (item.desc) text += ` _(${item.desc})_`;
    text += `: ${formatPrice(item.prices)}\n`;
  });
  return text;
}

function numLabel(n) {
  if (n === 0) return '0️⃣';
  if (n <= 9) return `${n}️⃣`;
  return `*${n}.*`;
}

function formatAllCategories() {
  const legalKeys = Object.keys(SERVICE_CATEGORIES).filter(k => SERVICE_CATEGORIES[k].legal);
  const officeKeys = Object.keys(SERVICE_CATEGORIES).filter(k => !SERVICE_CATEGORIES[k].legal);

  let text = `⚖️ *Tarifario de Servicios — Gurú Soluciones*\n\n` +
    `Todos los precios en pesos dominicanos (RD$).\n\n` +
    `📜 *Servicios Legales:*\n`;

  legalKeys.forEach((key, i) => {
    text += `${numLabel(i + 1)} ${SERVICE_CATEGORIES[key].emoji} ${SERVICE_CATEGORIES[key].name}\n`;
  });

  text += `\n🏪 *Servicios de Oficina:*\n`;
  officeKeys.forEach((key, i) => {
    text += `${numLabel(legalKeys.length + i + 1)} ${SERVICE_CATEGORIES[key].emoji} ${SERVICE_CATEGORIES[key].name}\n`;
  });

  text += `\n0️⃣ Regresar al menú principal`;
  text += `\n\nSeleccione un número para ver los precios detallados.`;
  return text;
}

module.exports = { SERVICE_CATEGORIES, formatPrice, formatCategory, formatAllCategories, numLabel };
