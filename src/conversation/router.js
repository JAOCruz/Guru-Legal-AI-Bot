const Client = require('../models/Client');
const { getOrCreateSession, transitionTo, checkGlobalCommand, handleGlobalCommand } = require('./stateManager');
const { MSG, LIST } = require('./messages');
const { withList } = require('../whatsapp/interactive');
const { detectIntent, isMenuChoice } = require('./nlp');
const { searchKnowledge, formatSearchResults } = require('../knowledge/search');
const config = require('../config');

const intakeFlow = require('./flows/intake');
const appointmentFlow = require('./flows/appointment');
const documentFlow = require('./flows/document');
const caseStatusFlow = require('./flows/caseStatus');
const legalInfoFlow = require('./flows/legalInfo');
const servicesFlow = require('./flows/services');

// Steps that accept free text input — everything else only expects numbers
const FREE_TEXT_STEPS = new Set([
  'main_menu:init', 'main_menu:show',
  'intake:welcome_choice', 'intake:ask_name', 'intake:confirm_name', 'intake:ask_email',
  'intake:ask_address', 'intake:ask_case_type', 'intake:ask_description',
  'intake:ask_urgency', 'intake:quick_question', 'intake:confirm',
  'talk_to_lawyer:waiting',
  'case_status:ask_number', 'case_status:select_case',
  'legal_info:menu', 'legal_info:search',
  'document:ask_description', 'document:await_file',
  'appointment:ask_date',
]);

async function routeMessage(phone, text, msg, savedMedia = null) {
  const session = await getOrCreateSession(phone);

  // Check for global commands that override any flow
  const globalCmd = checkGlobalCommand(text);
  if (globalCmd && session.flow !== 'main_menu') {
    const response = await handleGlobalCommand(globalCmd, session);
    if (response) {
      if (globalCmd === 'menu') return withList(response, LIST.MAIN_MENU);
      return response;
    }
  }

  // In structured flows: if user sends free text at a number-only step,
  // respond with AI and return to main menu instead of "opción no válida"
  const flowStep = `${session.flow}:${session.step}`;
  const trimmed = text.trim();
  const isNumber = /^\d+$/.test(trimmed);
  if (!FREE_TEXT_STEPS.has(flowStep) && !isNumber && trimmed.length > 2) {
    console.log(`[Router] Free text in structured flow (${flowStep}): "${trimmed.substring(0, 50)}" — using smart fallback`);
    await transitionTo(session, 'main_menu', 'show');
    return await handleSmartFallback(session, text, savedMedia);
  }

  // Route to the active flow
  switch (session.flow) {
    case 'main_menu':
      return await handleMainMenu(session, text, msg, savedMedia);

    case 'intake':
      return await intakeFlow.handle(session, text, msg);

    case 'appointment':
      return await appointmentFlow.handle(session, text, msg);

    case 'document':
      return await documentFlow.handle(session, text, msg, savedMedia);

    case 'case_status':
      return await caseStatusFlow.handle(session, text);

    case 'legal_info':
      return await legalInfoFlow.handle(session, text);

    case 'services':
      return await servicesFlow.handle(session, text);

    case 'talk_to_lawyer':
      return await handleTalkToLawyer(session, text);

    default:
      await transitionTo(session, 'main_menu', 'init');
      return await handleMainMenu(session, text, msg, savedMedia);
  }
}

async function handleMainMenu(session, text, msg, savedMedia = null) {
  const step = session.step;

  // First-time interaction
  if (step === 'init') {
    const client = await Client.findByPhone(session.phone);

    if (client) {
      const ConversationSession = require('../models/ConversationSession');
      await ConversationSession.setClientId(session.id, client.id);
      session.client_id = client.id;
    }

    await transitionTo(session, 'main_menu', 'show');

    // If user sent something substantive (not just "hola" or a number),
    // process their actual message instead of ignoring it with a greeting
    const trimmed = text.trim();
    const isSubstantive = trimmed.length > 4 && !/^\d+$/.test(trimmed);

    if (isSubstantive) {
      // Check if it's just a simple greeting
      let intent = null;
      if (config.gemini.enabled) {
        const { detectIntentLLM } = require('../llm/generate');
        intent = await detectIntentLLM(text);
      }
      if (!intent) intent = detectIntent(text);

      // Only show greeting for actual greetings — everything else, process it
      if (intent !== 'greeting') {
        console.log(`[Router] Substantive first message (intent: ${intent}): "${trimmed.substring(0, 50)}" — processing`);
        return await handleMainMenu({ ...session, step: 'show' }, text, msg, savedMedia);
      }
    }

    // Simple greeting or short text — show welcome + menu
    if (config.gemini.enabled) {
      const { generateGreeting } = require('../llm/generate');
      const greeting = client
        ? await generateGreeting('returning', client.name)
        : await generateGreeting('new');
      if (greeting) {
        const fullText = greeting + '\n\n' + MSG.MAIN_MENU;
        return withList(fullText, { ...LIST.MAIN_MENU, text: greeting + '\n\n¿En qué puedo orientarle?' });
      }
    }
    const welcomeText = client ? MSG.WELCOME_BACK(client.name) : MSG.WELCOME_NEW_SHORT;
    return withList(welcomeText + '\n\n' + MSG.MAIN_MENU, { ...LIST.MAIN_MENU, text: welcomeText + '\n\n¿En qué puedo orientarle?' });
  }

  // Menu shown, waiting for selection
  if (step === 'show') {
    // Try numeric selection first (menu now goes 0-7)
    const choice = isMenuChoice(text, 7);
    if (choice !== null) {
      return await handleMenuChoice(session, choice);
    }

    // Try LLM intent detection first, fall back to regex
    let intent = null;
    if (config.gemini.enabled) {
      const { detectIntentLLM } = require('../llm/generate');
      intent = await detectIntentLLM(text);
      if (intent) console.log(`[Router] LLM intent: "${intent}" for: "${text.substring(0, 50)}"`);
    }
    if (!intent) {
      intent = detectIntent(text);
      console.log(`[Router] Regex intent: "${intent}" for: "${text.substring(0, 50)}"`);
    }
    switch (intent) {
      case 'register':
        // Only start registration for explicit "registrarme" requests
        return await handleMenuChoice(session, 1);
      case 'intake':
      case 'legal_info':
      case 'services':
      case 'appointment':
      case 'document':
        // All conversational intents → natural LLM conversation (no forced registration)
        return await handleSmartFallback(session, text, savedMedia);
      case 'case_status':
        return await handleMenuChoice(session, 4);
      case 'talk_to_lawyer':
        return await handleMenuChoice(session, 7);
      case 'goodbye':
        return await handleGlobalCommand('goodbye', session);
      case 'help':
        return MSG.HELP;
      case 'greeting':
        // Already at menu — brief LLM acknowledgment or static menu
        return withList(MSG.MAIN_MENU, LIST.MAIN_MENU);
      case 'casual':
      case 'unknown':
      case 'confirm_yes':
      case 'confirm_no':
      case 'skip':
      default:
        // Natural conversational response for anything
        return await handleSmartFallback(session, text, savedMedia);
    }
  }

  // Fallback
  await transitionTo(session, 'main_menu', 'show');
  return withList(MSG.MAIN_MENU, LIST.MAIN_MENU);
}

async function handleMenuChoice(session, choice) {
  switch (choice) {
    case 0:
      return await handleGlobalCommand('goodbye', session);

    case 1: {
      const client = await Client.findByPhone(session.phone);
      if (client) {
        await transitionTo(session, 'intake', 'ask_case_type', { name: client.name, email: client.email, address: client.address });
        const txt = `${client.name}, ya está registrado/a en nuestro sistema.\n\nProcedamos con su nueva consulta.\n\n` + MSG.INTAKE_ASK_CASE_TYPE;
        return withList(txt, { ...LIST.CASE_TYPE, text: `${client.name}, ya está registrado/a en nuestro sistema.\n\nProcedamos con su nueva consulta.\n\n¿Qué tipo de asunto legal necesita atender?` });
      }
      await transitionTo(session, 'intake', 'ask_name');
      return MSG.INTAKE_ASK_NAME;
    }

    case 2: {
      if (!session.client_id) {
        await transitionTo(session, 'intake', 'ask_name', { returnTo: 'appointment' });
        return 'Para agendar una cita, primero necesitamos sus datos.\n\n' + MSG.INTAKE_ASK_NAME;
      }
      await transitionTo(session, 'appointment', 'ask_type');
      return withList(MSG.APPOINTMENT_INTRO, LIST.APPOINTMENT_TYPE);
    }

    case 3: {
      if (!session.client_id) {
        await transitionTo(session, 'intake', 'ask_name', { returnTo: 'document' });
        return 'Para enviar documentos, primero necesitamos registrar sus datos.\n\n' + MSG.INTAKE_ASK_NAME;
      }
      await transitionTo(session, 'document', 'ask_type');
      return withList(MSG.DOCUMENT_INTRO, LIST.DOCUMENT_TYPE);
    }

    case 4:
      await transitionTo(session, 'case_status', 'ask_or_list');
      return await caseStatusFlow.handle({ ...session, step: 'ask_or_list', data: {} }, '');

    case 5: {
      const { buildTopicMenu } = require('./flows/legalInfo');
      await transitionTo(session, 'legal_info', 'menu');
      return buildTopicMenu();
    }

    case 6: {
      const { formatAllCategories } = require('../knowledge/services');
      await transitionTo(session, 'services', 'menu');
      return formatAllCategories();
    }

    case 7:
      await transitionTo(session, 'talk_to_lawyer', 'waiting');
      return MSG.TALK_TO_LAWYER;

    default:
      return withList(MSG.INVALID_OPTION + '\n\n' + MSG.MAIN_MENU, LIST.MAIN_MENU);
  }
}

async function handleSmartFallback(session, text, savedMedia = null) {
  // Search knowledge base for context
  const results = searchKnowledge(text || '');
  const kbContext = results.length > 0 ? formatSearchResults(results, 1) : '';

  // Include media analysis as additional context for the LLM
  let mediaContext = '';
  if (savedMedia?.analysis) {
    const label = savedMedia.media_type === 'image' ? 'una imagen' : 'un documento';
    mediaContext = `\n\n[El cliente envió ${label}. Análisis del archivo:\n${savedMedia.analysis}]`;
  }

  // Try LLM with knowledge base context (RAG-lite) + conversation history
  if (config.gemini.enabled) {
    const Message = require('../models/Message');
    const { generateLegalResponse } = require('../llm/generate');

    // Fetch recent conversation for context-aware responses
    let history = [];
    try {
      history = await Message.findRecentByPhone(session.phone, 8);
    } catch (err) {
      console.error('[Router] Error fetching conversation history:', err.message);
    }

    const query = text || (savedMedia?.analysis ? 'El cliente envió un archivo.' : '');
    const llmResponse = await generateLegalResponse(query, kbContext + mediaContext, history);
    if (llmResponse) {
      console.log(`[LLM] Smart fallback responded to: "${(text || '[media]').substring(0, 50)}"`);
      return llmResponse;
    }
  }

  // Fallback: show keyword results directly
  if (kbContext) {
    return kbContext;
  }

  return withList(MSG.INVALID_OPTION + '\n\n' + MSG.MAIN_MENU, LIST.MAIN_MENU);
}

async function handleTalkToLawyer(session, text) {
  const intent = detectIntent(text);
  if (intent === 'urgent') {
    await transitionTo(session, 'main_menu', 'show', {});
    return withList(MSG.TALK_TO_LAWYER_URGENT + '\n\n' + MSG.MAIN_MENU, LIST.MAIN_MENU);
  }

  // Any other message — log it and go back to menu
  await transitionTo(session, 'main_menu', 'show', {});
  return withList('Su mensaje ha sido enviado a nuestro equipo legal. Le contactaremos a la brevedad.\n\n' + MSG.MAIN_MENU, LIST.MAIN_MENU);
}

module.exports = { routeMessage };
