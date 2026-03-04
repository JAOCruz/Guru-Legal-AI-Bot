/**
 * Field Extractor
 * Uses Gemini Vision to extract legal document fields from images (cédulas, passports, docs)
 * Also uses AI to extract fields from free-form text
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract person data from a cédula/passport image
 * Returns: { nombre, cedula, genero, nacionalidad }
 */
async function extractFromCedula(imagePath) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

    const prompt = `Analiza esta imagen de cédula de identidad, pasaporte u otro documento de identidad dominicano.
Extrae EXACTAMENTE la siguiente información en formato JSON:
{
  "nombre": "nombre completo como aparece en el documento",
  "cedula": "número de cédula/pasaporte (solo números y guiones)",
  "genero": "M o F",
  "nacionalidad": "dominicana u otro"
}
Si no puedes leer algún campo, usa null. Solo devuelve el JSON, sin explicaciones.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: base64 } }
    ]);
    
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[Extractor] Image extraction failed:', err.message);
    return null;
  }
}

/**
 * Extract multiple fields from free-form text using AI
 * Returns object with any detected field values
 */
async function extractFromText(text, templateKey, existingData = {}) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Analiza este mensaje de un cliente para un bufete legal en República Dominicana.
Extrae cualquier información relevante para un documento legal.

Mensaje del cliente: "${text}"

Busca y extrae (si están presentes):
- Nombres de personas (propietario, inquilino, vendedor, comprador, poderdante, apoderado, garante)
- Números de cédula (formato XXX-XXXXXXX-X)
- Montos de dinero (en pesos o sin especificar)
- Direcciones o ubicaciones
- Descripciones de inmuebles, vehículos
- Marcas, modelos, años, placas de vehículos
- Propósitos o finalidades (para poderes)
- Fechas
- Género (señor/señora → M/F)

Devuelve SOLO un JSON con los campos que puedas identificar del mensaje.
Usa las claves exactas según el tipo de contrato (${templateKey}).
Si no hay información clara, devuelve {}.
Solo el JSON, sin explicaciones.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[Extractor] Text extraction failed:', err.message);
    return {};
  }
}

/**
 * Smart extractor: tries to get fields from whatever was sent
 * Handles single or multiple images (cédulas) and text
 * savedMedia can have an .allMedia array for batch processing
 */
async function extractFields(message, imagePath, templateKey, existingData = {}, allMedia = null) {
  const extracted = {};
  const roles = getRolesForTemplate(templateKey);

  // Process multiple images if available (batch mode)
  const imagePaths = allMedia
    ? allMedia.filter(m => m.media_type === 'image').map(m => m.file_path)
    : imagePath ? [imagePath] : [];

  if (imagePaths.length > 0) {
    // Process all images in parallel
    const imageResults = await Promise.all(
      imagePaths.map(p => extractFromCedula(p).catch(() => null))
    );

    // Assign each extracted identity to the next unfilled role
    let workingData = { ...existingData };
    for (const imageData of imageResults) {
      if (!imageData?.nombre) continue;
      console.log('[Extractor] Image data:', imageData);

      const unfilledRole = roles.find(role => !workingData[`${role}_nombre`] && !extracted[`${role}_nombre`]);
      if (unfilledRole) {
        extracted[`${unfilledRole}_nombre`] = imageData.nombre;
        if (imageData.cedula) extracted[`${unfilledRole}_cedula`] = imageData.cedula;
        if (imageData.genero) extracted[`${unfilledRole}_genero`] = imageData.genero;
        // Mark as filled in working copy so next image gets next role
        workingData[`${unfilledRole}_nombre`] = imageData.nombre;
      }
    }
  }

  // Also extract from text
  if (message && message.trim().length > 2) {
    const textData = await extractFromText(message, templateKey, { ...existingData, ...extracted });
    Object.assign(extracted, textData);
  }

  return extracted;
}

function getRolesForTemplate(templateKey) {
  const roleMap = {
    contrato_alquiler_vivienda: ['propietario', 'inquilino', 'garante'],
    contrato_alquiler_comercial: ['propietario', 'inquilino'],
    acto_venta_vehiculo: ['vendedor', 'comprador'],
    poder_autorizacion: ['poderdante', 'apoderado'],
  };
  return roleMap[templateKey] || [];
}

module.exports = { extractFromCedula, extractFromText, extractFields };
