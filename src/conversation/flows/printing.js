const { transitionTo } = require('../stateManager');
const { MSG } = require('../messages');
const { isMenuChoice, normalize } = require('../nlp');
const { SERVICE_CATEGORIES } = require('../../knowledge/services');

const PRINT_ITEMS = SERVICE_CATEGORIES.impresiones.items;

// Lookup helpers
function getPrintPrice(colorType, size) {
  // colorType: 'bw' | 'color'
  // size: '8x11' | '8x14' | '11x17'
  const itemName = colorType === 'color' ? 'Impresión Full Color' : 'Impresión Blanco y Negro';
  const item = PRINT_ITEMS.find(i => i.name === itemName);
  return item ? item.prices[size] || null : null;
}

async function handle(session, text, msg, savedMedia = null) {
  const step = session.step;

  switch (step) {
    case 'ask_color': {
      await transitionTo(session, 'printing', 'waiting_color');
      return (
        `🖨️ ¡Excelente!!\n\n` +
        `¿Le gustaría a *COLOR* o a *BLANCO y NEGRO*?\n\n` +
        `1️⃣ Blanco y Negro\n` +
        `2️⃣ Full Color`
      );
    }

    case 'waiting_color': {
      const norm = normalize(text);
      const choice = isMenuChoice(text, 2);
      let colorType = null;

      if (choice === 1) colorType = 'bw';
      else if (choice === 2) colorType = 'color';
      else if (/blanco|negro|bn|b\s*y\s*n|monocrom/.test(norm)) colorType = 'bw';
      else if (/color|full/.test(norm)) colorType = 'color';

      if (!colorType) {
        return `Por favor, seleccione:\n\n1️⃣ *Blanco y Negro*\n2️⃣ *Full Color*`;
      }

      await transitionTo(session, 'printing', 'ask_size', { colorType });

      return (
        `¿Qué tamaño necesita?\n\n` +
        `1️⃣ *8.5 x 11* (carta)\n` +
        `2️⃣ *8.5 x 14* (legal)\n` +
        `3️⃣ *11 x 17* (tabloide)`
      );
    }

    case 'ask_size': {
      const norm = normalize(text);
      const choice = isMenuChoice(text, 3);
      let size = null;

      if (choice === 1) size = '8x11';
      else if (choice === 2) size = '8x14';
      else if (choice === 3) size = '11x17';
      else if (/8.?5?\s*x?\s*11|carta/.test(norm)) size = '8x11';
      else if (/8.?5?\s*x?\s*14|legal|oficio/.test(norm)) size = '8x14';
      else if (/11\s*x?\s*17|tabloide/.test(norm)) size = '11x17';

      if (!size) {
        return `Por favor, seleccione el tamaño:\n\n1️⃣ *8.5 x 11*\n2️⃣ *8.5 x 14*\n3️⃣ *11 x 17*`;
      }

      const { colorType } = session.data;
      const pricePerPage = getPrintPrice(colorType, size);

      await transitionTo(session, 'printing', 'ask_quantity', { ...session.data, size, pricePerPage });

      const colorLabel = colorType === 'color' ? 'Full Color' : 'Blanco y Negro';
      const sizeLabel = size === '8x11' ? '8.5x11' : size === '8x14' ? '8.5x14' : '11x17';

      return (
        `*${colorLabel}* en *${sizeLabel}*: RD$ ${pricePerPage} por página\n\n` +
        `¿Cuántas páginas necesita imprimir?`
      );
    }

    case 'ask_quantity': {
      const qty = parseInt(text.trim(), 10);
      if (isNaN(qty) || qty < 1 || qty > 1000) {
        return `Por favor, indique la cantidad de páginas (número entre 1 y 1000).`;
      }

      const { colorType, size, pricePerPage } = session.data;
      const total = qty * pricePerPage;
      const colorLabel = colorType === 'color' ? 'Full Color' : 'Blanco y Negro';
      const sizeLabel = size === '8x11' ? '8.5x11' : size === '8x14' ? '8.5x14' : '11x17';

      await transitionTo(session, 'printing', 'confirm', { ...session.data, quantity: qty, total });

      return (
        `📋 *Resumen de Impresión:*\n\n` +
        `🖨️ Tipo: *${colorLabel}*\n` +
        `📐 Tamaño: *${sizeLabel}*\n` +
        `📄 Páginas: *${qty}*\n` +
        `💰 Precio: ${qty} × RD$ ${pricePerPage} = *RD$ ${total.toLocaleString('es-DO')}*\n\n` +
        `¿Desea proceder?\n\n` +
        `1️⃣ Sí, confirmar\n` +
        `2️⃣ Cambiar opciones\n` +
        `3️⃣ Cancelar`
      );
    }

    case 'confirm': {
      const choice = isMenuChoice(text, 3);
      if (choice === 1) {
        const { total } = session.data;
        await transitionTo(session, 'main_menu', 'show', {});
        return (
          `✅ ¡Pedido confirmado!\n\n` +
          `💰 Total: *RD$ ${total.toLocaleString('es-DO')}*\n\n` +
          `Puede pasar a recogerlo en nuestras instalaciones o coordinar la entrega.\n` +
          `Le notificaremos cuando esté listo.\n\n` +
          `¿Necesita algo más?\n\n` +
          MSG.MENU_HINT
        );
      }
      if (choice === 2) {
        await transitionTo(session, 'printing', 'ask_color', {});
        return await handle({ ...session, step: 'ask_color' }, text);
      }
      await transitionTo(session, 'main_menu', 'show', {});
      return `Pedido cancelado. ¿En qué más puedo ayudarle?\n\n` + MSG.MENU_HINT;
    }

    default:
      await transitionTo(session, 'printing', 'ask_color');
      return await handle({ ...session, step: 'ask_color' }, text);
  }
}

module.exports = { handle };
