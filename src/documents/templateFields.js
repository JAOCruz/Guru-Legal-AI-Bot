/**
 * Required fields per document template.
 * Each field has: key, label (for asking), required, extractable (from images)
 */

const TEMPLATES = {
  contrato_alquiler_vivienda: {
    name: 'Contrato de Alquiler de Vivienda',
    file: 'contrato_alquiler_vivienda.docx',
    emoji: '🏠',
    fields: [
      { key: 'propietario_nombre', label: 'nombre completo del propietario/a', required: true, fromImage: true },
      { key: 'propietario_cedula', label: 'cédula del propietario/a', required: true, fromImage: true },
      { key: 'propietario_genero', label: null, required: true, default: 'M', hidden: true }, // M/F
      { key: 'inquilino_nombre', label: 'nombre completo del inquilino/a', required: true, fromImage: true },
      { key: 'inquilino_cedula', label: 'cédula del inquilino/a', required: true, fromImage: true },
      { key: 'inquilino_genero', label: null, required: true, default: 'M', hidden: true },
      { key: 'descripcion_inmueble', label: 'descripción del inmueble (ej: apartamento 2 hab., casa, local)', required: true },
      { key: 'direccion_inmueble', label: 'dirección del inmueble', required: true },
      { key: 'monto_alquiler', label: 'monto mensual del alquiler en pesos (RD$)', required: true },
      { key: 'garante_nombre', label: 'nombre del garante/fiador (opcional, escribe "no" si no aplica)', required: false, fromImage: true },
      { key: 'garante_cedula', label: 'cédula del garante', required: false, fromImage: true },
      { key: 'fecha_contrato', label: null, required: true, auto: true }, // auto-filled with today
    ],
    notario: { nombre: 'DR. RAMON ANIBAL GUZMAN MENDEZ', matricula: '4745' }
  },

  contrato_alquiler_comercial: {
    name: 'Contrato de Alquiler de Local Comercial',
    file: 'contrato_alquiler_comercial.docx',
    emoji: '🏢',
    fields: [
      { key: 'propietario_nombre', label: 'nombre o empresa del propietario/a', required: true, fromImage: true },
      { key: 'propietario_cedula', label: 'cédula o RNC del propietario/a', required: true, fromImage: true },
      { key: 'inquilino_nombre', label: 'nombre o empresa del arrendatario', required: true, fromImage: true },
      { key: 'inquilino_cedula', label: 'cédula o RNC del arrendatario', required: true, fromImage: true },
      { key: 'descripcion_local', label: 'descripción del local comercial', required: true },
      { key: 'direccion_inmueble', label: 'dirección del local', required: true },
      { key: 'monto_alquiler', label: 'monto mensual del alquiler en pesos (RD$)', required: true },
      { key: 'uso_comercial', label: 'uso/actividad comercial del local', required: true },
      { key: 'fecha_contrato', label: null, required: true, auto: true },
    ]
  },

  acto_venta_vehiculo: {
    name: 'Acto de Venta de Vehículo',
    file: 'acto_venta_vehiculo.docx',
    emoji: '🚗',
    fields: [
      { key: 'vendedor_nombre', label: 'nombre completo del vendedor', required: true, fromImage: true },
      { key: 'vendedor_cedula', label: 'cédula del vendedor', required: true, fromImage: true },
      { key: 'comprador_nombre', label: 'nombre completo del comprador', required: true, fromImage: true },
      { key: 'comprador_cedula', label: 'cédula del comprador', required: true, fromImage: true },
      { key: 'vehiculo_marca', label: 'marca del vehículo (ej: Toyota)', required: true },
      { key: 'vehiculo_modelo', label: 'modelo del vehículo (ej: Corolla)', required: true },
      { key: 'vehiculo_año', label: 'año del vehículo', required: true },
      { key: 'vehiculo_color', label: 'color del vehículo', required: true },
      { key: 'vehiculo_placa', label: 'número de placa', required: true },
      { key: 'vehiculo_chasis', label: 'número de chasis/VIN', required: false },
      { key: 'precio_venta', label: 'precio de venta en pesos (RD$)', required: true },
      { key: 'fecha_contrato', label: null, required: true, auto: true },
      // Optional apoderado — asked separately after required fields are complete
      { key: 'apoderado_nombre', label: 'nombre del apoderado (DGII)', required: false, fromImage: true, apoderado: true },
      { key: 'apoderado_cedula', label: 'cédula del apoderado', required: false, fromImage: true, apoderado: true },
    ]
  },

  acto_venta_inmueble: {
    name: 'Acto de Venta de Inmueble',
    file: 'acto_venta_inmueble.docx',
    emoji: '🏡',
    fields: [
      { key: 'vendedor_nombre', label: 'nombre completo del vendedor', required: true, fromImage: true },
      { key: 'vendedor_cedula', label: 'cédula del vendedor', required: true, fromImage: true },
      { key: 'comprador_nombre', label: 'nombre completo del comprador', required: true, fromImage: true },
      { key: 'comprador_cedula', label: 'cédula del comprador', required: true, fromImage: true },
      { key: 'descripcion_inmueble', label: 'descripción del inmueble (ej: apartamento, solar, casa)', required: true },
      { key: 'direccion_inmueble', label: 'dirección del inmueble', required: true },
      { key: 'titulo_numero', label: 'número de Certificado de Título (si lo tiene, sino escribe "pendiente")', required: false },
      { key: 'parcela', label: 'número de parcela y distrito catastral (si lo tiene)', required: false },
      { key: 'precio_venta', label: 'precio de venta en pesos (RD$)', required: true },
      { key: 'fecha_contrato', label: null, required: true, auto: true },
    ]
  },

  poder_autorizacion: {
    name: 'Poder de Autorización',
    file: 'poder_autorizacion.docx',
    emoji: '📋',
    fields: [
      { key: 'poderdante_nombre', label: 'nombre completo de quien otorga el poder', required: true, fromImage: true },
      { key: 'poderdante_cedula', label: 'cédula de quien otorga el poder', required: true, fromImage: true },
      { key: 'apoderado_nombre', label: 'nombre completo de quien recibe el poder', required: true, fromImage: true },
      { key: 'apoderado_cedula', label: 'cédula de quien recibe el poder', required: true, fromImage: true },
      { key: 'proposito_poder', label: 'para qué es el poder (ej: retirar documentos en la DGII, tramitar visa, etc.)', required: true },
      { key: 'fecha_contrato', label: null, required: true, auto: true },
    ]
  }
};

// Map user-friendly requests to template keys
const INTENT_MAP = {
  'alquiler vivienda': 'contrato_alquiler_vivienda',
  'alquiler de vivienda': 'contrato_alquiler_vivienda',
  'contrato de alquiler': 'contrato_alquiler_vivienda',
  'contrato alquiler': 'contrato_alquiler_vivienda',
  'alquiler': 'contrato_alquiler_vivienda',
  'alquiler local': 'contrato_alquiler_comercial',
  'alquiler comercial': 'contrato_alquiler_comercial',
  'local comercial': 'contrato_alquiler_comercial',
  'venta vehiculo': 'acto_venta_vehiculo',
  'venta de vehiculo': 'acto_venta_vehiculo',
  'venta carro': 'acto_venta_vehiculo',
  'venta de carro': 'acto_venta_vehiculo',
  'venta inmueble': 'acto_venta_inmueble',
  'venta de inmueble': 'acto_venta_inmueble',
  'acto de venta de inmueble': 'acto_venta_inmueble',
  'venta casa': 'acto_venta_inmueble',
  'venta de casa': 'acto_venta_inmueble',
  'venta solar': 'acto_venta_inmueble',
  'venta de solar': 'acto_venta_inmueble',
  'venta apartamento': 'acto_venta_inmueble',
  'venta de apartamento': 'acto_venta_inmueble',
  'acto de venta': 'acto_venta_vehiculo',
  'poder': 'poder_autorizacion',
  'poder notarial': 'poder_autorizacion',
  'poder de autorizacion': 'poder_autorizacion',
  'autorizacion': 'poder_autorizacion',
};

function detectTemplateFromText(text) {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [key, tmpl] of Object.entries(INTENT_MAP)) {
    const keyNorm = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(keyNorm)) return tmpl;
  }
  return null;
}

function getMissingFields(templateKey, collectedData) {
  const template = TEMPLATES[templateKey];
  if (!template) return [];
  return template.fields.filter(f => 
    f.required && !f.auto && !f.hidden && !collectedData[f.key]
  );
}

function getNextQuestion(templateKey, collectedData) {
  const missing = getMissingFields(templateKey, collectedData);
  return missing[0] || null;
}

module.exports = { TEMPLATES, detectTemplateFromText, getMissingFields, getNextQuestion };
