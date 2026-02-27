const { transitionTo } = require('../stateManager');
const { MSG } = require('../messages');
const { SERVICE_CATEGORIES, formatCategory, formatAllCategories, formatPrice } = require('../../knowledge/services');
const { detectDirectService, normalize } = require('../nlp');

const CATEGORY_KEYS = Object.keys(SERVICE_CATEGORIES);

// Check if a service is notarial (can offer redacción vs redacción + notarización)
function isNotarialService(category, item) {
  const cat = SERVICE_CATEGORIES[category];
  if (!cat) return false;
  const found = cat.items.find(i => i.name === item);
  return found && (found.desc || '').toLowerCase().includes('auténtico');
}

function formatDirectServiceResponse(category, itemName) {
  const cat = SERVICE_CATEGORIES[category];
  if (!cat) return null;
  const item = cat.items.find(i => i.name === itemName);
  if (!item) return null;

  const isNotarial = isNotarialService(category, itemName);
  const basePrice = item.prices.unico || null;

  if (isNotarial && basePrice) {
    // Offer redacción vs redacción + notarización
    const redaccionPrice = Math.round(basePrice * 0.6); // approximate split
    return (
      `🦉 ¡Podemos ayudarte!\n\n` +
      `Para la *${itemName.toUpperCase()}*, ¿te gustaría solo la *REDACCIÓN* o ambos servicios *REDACCIÓN + NOTARIZACIÓN*?\n\n` +
      `1️⃣ Solo Redacción — ~RD$ ${redaccionPrice}\n` +
      `2️⃣ Redacción + Notarización — RD$ ${basePrice}\n\n` +
      `_El acto notariado tiene plena fe pública conforme a la Ley 140-15._`
    );
  }

  return (
    `🦉 ¡Podemos ayudarte!\n\n` +
    `*${itemName}*\n` +
    (item.desc ? `_(${item.desc})_\n` : '') +
    `💰 Precio: ${formatPrice(item.prices)}\n\n` +
    `¿Le gustaría proceder?\n\n` +
    `1️⃣ Sí, proceder\n` +
    `2️⃣ Ver más servicios\n` +
    `3️⃣ Regresar al menú`
  );
}

async function handle(session, text) {
  const step = session.step;

  switch (step) {
    case 'direct_service': {
      // User saw a direct service offer, waiting for choice
      const choice = parseInt(text.trim(), 10);
      const { directCategory, directItem, isNotarial: wasNotarial } = session.data || {};

      if (wasNotarial) {
        if (choice === 1 || choice === 2) {
          const cat = SERVICE_CATEGORIES[directCategory];
          const item = cat?.items.find(i => i.name === directItem);
          const label = choice === 1 ? 'Redacción' : 'Redacción + Notarización';
          const price = choice === 1 ? `~RD$ ${Math.round((item?.prices.unico || 0) * 0.6)}` : `RD$ ${item?.prices.unico || 0}`;

          await transitionTo(session, 'main_menu', 'show', {});
          return (
            `¡Excelente!!\n\n` +
            `📝 *${directItem}* — ${label}\n` +
            `💰 Precio: ${price}\n\n` +
            `Para proceder, puede visitarnos en nuestras instalaciones o enviarnos la documentación por aquí.\n\n` +
            `¿Necesita algo más?\n\n` +
            MSG.MENU_HINT
          );
        }
      } else {
        if (choice === 1) {
          await transitionTo(session, 'main_menu', 'show', {});
          return (
            `¡Excelente!! Su solicitud ha sido registrada.\n\n` +
            `Puede visitarnos o coordinar por aquí.\n\n` +
            `¿Necesita algo más?\n\n` +
            MSG.MENU_HINT
          );
        }
        if (choice === 2) {
          await transitionTo(session, 'services', 'menu');
          return formatAllCategories();
        }
      }

      if (choice === 3 || choice === 0) {
        await transitionTo(session, 'main_menu', 'show', {});
        return MSG.MAIN_MENU;
      }

      // Try detecting another direct service from text
      const direct = detectDirectService(text);
      if (direct) {
        const response = formatDirectServiceResponse(direct.category, direct.itemName);
        if (response) {
          const notarial = isNotarialService(direct.category, direct.itemName);
          await transitionTo(session, 'services', 'direct_service', {
            directCategory: direct.category,
            directItem: direct.itemName,
            isNotarial: notarial,
          });
          return response;
        }
      }

      await transitionTo(session, 'services', 'menu');
      return formatAllCategories();
    }

    case 'menu': {
      const choice = parseInt(text.trim(), 10);

      if (choice === 0) {
        await transitionTo(session, 'main_menu', 'show', {});
        return MSG.MAIN_MENU;
      }

      if (!isNaN(choice) && choice >= 1 && choice <= CATEGORY_KEYS.length) {
        const catText = formatCategory(CATEGORY_KEYS[choice - 1]);
        await transitionTo(session, 'services', 'post_category', {});
        return catText + '\n\n' + POST_CATEGORY_MENU;
      }

      // Try direct service detection from text
      const direct = detectDirectService(text);
      if (direct) {
        const response = formatDirectServiceResponse(direct.category, direct.itemName);
        if (response) {
          const notarial = isNotarialService(direct.category, direct.itemName);
          await transitionTo(session, 'services', 'direct_service', {
            directCategory: direct.category,
            directItem: direct.itemName,
            isNotarial: notarial,
          });
          return response;
        }
      }

      return 'Por favor, seleccione un número válido de la lista.';
    }

    case 'post_category': {
      const choice = text.trim();
      if (choice === '1') {
        await transitionTo(session, 'services', 'menu');
        return formatAllCategories();
      }
      if (choice === '2') {
        await transitionTo(session, 'main_menu', 'show', {});
        return MSG.MAIN_MENU;
      }
      return MSG.INVALID_OPTION;
    }

    default:
      await transitionTo(session, 'services', 'menu');
      return formatAllCategories();
  }
}

const POST_CATEGORY_MENU =
  `¿Qué desea hacer?\n\n` +
  `1️⃣ Ver otra categoría\n` +
  `2️⃣ Regresar al menú principal`;

module.exports = { handle, formatDirectServiceResponse, isNotarialService };
