const { transitionTo } = require('../stateManager');
const { MSG } = require('../messages');
const { isMenuChoice, normalize } = require('../nlp');
const { SERVICE_CATEGORIES, formatPrice } = require('../../knowledge/services');

// Pricing references
const CERT_BUENA_COSTUMBRE = SERVICE_CATEGORIES.servicios_digitales.items.find(i => i.name === 'Certificación Buena Costumbre');
const CERT_BUENA_CONDUCTA = SERVICE_CATEGORIES.notoriedades.items.find(i => i.name === 'Buena Conducta');
const APOSTILLA = SERVICE_CATEGORIES.servicios_digitales.items.find(i => i.name === 'Apostilla en Cancillería');

async function handle(session, text) {
  const step = session.step;

  switch (step) {
    case 'ask_purpose': {
      // Client just entered certificate flow — ask purpose
      await transitionTo(session, 'certificate', 'waiting_purpose');
      return (
        `🦉 ¡Excelente!!\n\n` +
        `· ¿Para qué fines necesitas el *CERTIFICADO*?\n\n` +
        `1️⃣ Uso nacional (trámites locales)\n` +
        `2️⃣ Uso internacional (apostilla / viaje)\n` +
        `3️⃣ Empleo o solicitud laboral\n` +
        `4️⃣ Otro\n\n` +
        `_Puede escribir el número o describir para qué lo necesita._`
      );
    }

    case 'waiting_purpose': {
      const norm = normalize(text);
      let purpose = null;
      const choice = isMenuChoice(text, 4);

      if (choice === 1) purpose = 'nacional';
      else if (choice === 2) purpose = 'internacional';
      else if (choice === 3) purpose = 'empleo';
      else if (choice === 4) purpose = 'otro';
      else if (/apostill|internacional|viaj|exterior|embajada|consulado/.test(norm)) purpose = 'internacional';
      else if (/empleo|trabajo|laboral|empresa/.test(norm)) purpose = 'empleo';
      else if (/cualquier|todo|general/.test(norm)) purpose = 'internacional'; // suggest best
      else purpose = 'otro';

      await transitionTo(session, 'certificate', 'show_options', { purpose });

      if (purpose === 'internacional') {
        return (
          `Para uso *INTERNACIONAL*, le recomendamos:\n\n` +
          `1️⃣ *Certificación Buena Costumbre* (No antecedentes penales)\n` +
          `   💰 RD$ ${CERT_BUENA_COSTUMBRE.prices.unico}\n\n` +
          `2️⃣ *Buena Conducta* (Acto de Notoriedad)\n` +
          `   💰 RD$ ${CERT_BUENA_CONDUCTA.prices.unico}\n\n` +
          `➕ *Apostilla en Cancillería*: ${formatPrice(APOSTILLA.prices)} adicional\n\n` +
          `👉 Le recomendamos la opción *1 + Apostilla* para que sea válido en cualquier escenario.\n\n` +
          `¿Cuál prefiere?`
        );
      }

      return (
        `Tenemos estas opciones para usted:\n\n` +
        `1️⃣ *Certificación Buena Costumbre* (No antecedentes penales)\n` +
        `   💰 RD$ ${CERT_BUENA_COSTUMBRE.prices.unico}\n\n` +
        `2️⃣ *Buena Conducta* (Acto de Notoriedad)\n` +
        `   💰 RD$ ${CERT_BUENA_CONDUCTA.prices.unico}\n\n` +
        `¿Cuál le gustaría? También puede agregar *Apostilla* (${formatPrice(APOSTILLA.prices)}) si lo necesita para uso internacional.`
      );
    }

    case 'show_options': {
      const norm = normalize(text);
      const choice = isMenuChoice(text, 2);
      let selected = null;
      let addApostille = false;

      if (choice === 1) selected = 'buena_costumbre';
      else if (choice === 2) selected = 'buena_conducta';
      else if (/costumbre|certificacion|antecedente/.test(norm)) selected = 'buena_costumbre';
      else if (/conducta|notoriedad/.test(norm)) selected = 'buena_conducta';
      else if (/ambos|los dos|todo/.test(norm)) selected = 'buena_costumbre';

      if (!selected) {
        return `Por favor, seleccione *1* o *2* para indicar qué certificado desea.`;
      }

      // Check if they mentioned apostille
      if (/apostill/.test(norm) || session.data?.purpose === 'internacional') {
        addApostille = true;
      }

      const price = selected === 'buena_costumbre' ? CERT_BUENA_COSTUMBRE.prices.unico : CERT_BUENA_CONDUCTA.prices.unico;
      const serviceName = selected === 'buena_costumbre' ? 'Certificación Buena Costumbre' : 'Buena Conducta (Notoriedad)';

      await transitionTo(session, 'certificate', 'confirm_apostille', { selected, price, serviceName });

      if (addApostille) {
        const apostilleMin = 250;
        const total = price + apostilleMin;
        return (
          `*${serviceName}*: RD$ ${price}\n` +
          `*Apostilla en Cancillería*: RD$ ${formatPrice(APOSTILLA.prices)}\n\n` +
          `💰 *Total aproximado: RD$ ${total} - ${price + 300}*\n\n` +
          `Recuerde que el impuesto del certificado puede variar según la tasa vigente.\n\n` +
          `¿Le gustaría proceder?\n\n` +
          `1️⃣ Sí, proceder\n` +
          `2️⃣ Sin apostilla (solo RD$ ${price})\n` +
          `3️⃣ Regresar al menú`
        );
      }

      return (
        `*${serviceName}*: RD$ ${price}\n\n` +
        `¿Desea agregar *Apostilla* (${formatPrice(APOSTILLA.prices)}) para validez internacional?\n\n` +
        `1️⃣ Sí, con apostilla\n` +
        `2️⃣ No, solo el certificado\n` +
        `3️⃣ Regresar al menú`
      );
    }

    case 'confirm_apostille': {
      const choice = isMenuChoice(text, 3);
      const norm = normalize(text);

      if (choice === 3 || /menu|regresar|volver/.test(norm)) {
        await transitionTo(session, 'main_menu', 'show', {});
        return MSG.MAIN_MENU;
      }

      let withApostille = false;
      if (choice === 1 || /si|apostill|internacional/.test(norm)) withApostille = true;

      const { price, serviceName } = session.data;
      const finalPrice = withApostille ? `RD$ ${price + 250} - ${price + 300}` : `RD$ ${price}`;

      await transitionTo(session, 'certificate', 'collect_info', {
        ...session.data,
        withApostille,
        finalPrice,
      });

      return (
        `¡Excelente!!\n\n` +
        `📝 *Resumen:*\n` +
        `• Servicio: *${serviceName}*${withApostille ? ' + Apostilla' : ''}\n` +
        `• Precio: *${finalPrice}*\n\n` +
        `Para proceder, necesitamos:\n` +
        `· Su *nombre completo* (como aparece en cédula)\n\n` +
        `Por favor, escríbalo:`
      );
    }

    case 'collect_info': {
      const name = text.trim();
      if (name.length < 3) {
        return `Por favor, indique su *nombre completo* tal como aparece en su cédula.`;
      }

      await transitionTo(session, 'certificate', 'confirm', { ...session.data, clientName: name });

      const { serviceName, withApostille, finalPrice } = session.data;
      return (
        `✅ *Confirmación de Solicitud*\n\n` +
        `👤 Nombre: *${name}*\n` +
        `📄 Servicio: *${serviceName}*${withApostille ? ' + Apostilla' : ''}\n` +
        `💰 Precio: *${finalPrice}*\n\n` +
        `¿Todo correcto?\n\n` +
        `1️⃣ Sí, confirmar\n` +
        `2️⃣ Corregir datos\n` +
        `3️⃣ Cancelar`
      );
    }

    case 'confirm': {
      const choice = isMenuChoice(text, 3);
      if (choice === 1) {
        await transitionTo(session, 'main_menu', 'show', {});
        return (
          `✅ ¡Su solicitud ha sido registrada!\n\n` +
          `Puede pasar por nuestras instalaciones o coordinar la entrega.\n` +
          `Le notificaremos cuando esté listo.\n\n` +
          `¿Necesita algo más?\n\n` +
          MSG.MENU_HINT
        );
      }
      if (choice === 2) {
        await transitionTo(session, 'certificate', 'collect_info');
        return `Por favor, indique su *nombre completo* nuevamente:`;
      }
      // Cancel
      await transitionTo(session, 'main_menu', 'show', {});
      return `Solicitud cancelada. ¿En qué más puedo ayudarle?\n\n` + MSG.MENU_HINT;
    }

    default:
      await transitionTo(session, 'certificate', 'ask_purpose');
      return await handle({ ...session, step: 'ask_purpose' }, text);
  }
}

module.exports = { handle };
