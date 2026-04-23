require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {
  BRANDS,
  CONTENT_TYPES,
  IMAGE_STYLES,
  CARD_COUNT_OPTIONS,
  normalizeInstagramHandle,
  CarouselEngine,
} = require('./telegram-carousel-core');
const { extractTopicCandidate } = require('./carousel-config');

const token =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.TELEGRAM_TOKEN ||
  process.env.ELEGRAM_BOT_TOKEN;
const allowedChatId = process.env.TELEGRAM_CHAT_ID || null;
const instagramHandle = normalizeInstagramHandle(
  process.env.INSTAGRAM_HANDLE ||
    process.env.POSTFORME_INSTAGRAM_HANDLE ||
    process.env.HANDLE ||
    '@thiagaoai'
);

if (!token) {
  console.error(
    'Missing Telegram bot token. Set TELEGRAM_BOT_TOKEN, TELEGRAM_TOKEN, or ELEGRAM_BOT_TOKEN.'
  );
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${token}`;
const sessions = new Map();
const engine = new CarouselEngine();

const FLOW_STEP = {
  idle: 'idle',
  chooseCompany: 'choose_company',
  chooseContentType: 'choose_content_type',
  chooseImageStyle: 'choose_image_style',
  chooseCardCount: 'choose_card_count',
  chooseLanguage: 'choose_language',
  captureTopic: 'capture_topic',
  previewReview: 'preview_review',
  done: 'done',
};

const NATURAL_START_PATTERN = /^(carrossel|carousel)\b/i;

const CALLBACK = {
  company: 'flow|company|',
  type: 'flow|type|',
  style: 'flow|style|',
  count: 'flow|count|',
  language: 'flow|lang|',
  topic: 'flow|topic|',
  approve: 'flow|approve|',
  regenImg: 'flow|regenimg|',
  regenStory: 'flow|regenstory|',
  cancelJob: 'flow|canceljob|',
  cancelWizard: 'flow|cancelwizard',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const chunk = (items, size) => {
  const rows = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
};

const isAllowedChat = (chatId) => {
  if (!allowedChatId) {
    return true;
  }

  return `${chatId}` === `${allowedChatId}`;
};

const apiCall = async (method, payload) => {
  const response = await fetch(`${API_BASE}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!json.ok) {
    throw new Error(json.description || `Telegram API error on ${method}`);
  }

  return json.result;
};

const sendMessage = (chatId, text, replyMarkup) =>
  apiCall('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup || undefined,
  });

const answerCallbackQuery = (callbackQueryId, text) =>
  apiCall('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false,
  });

const buildInlineKeyboard = (rows) => ({
  inline_keyboard: rows.map((row) =>
    row.map((button) => ({
      text: button.text,
      callback_data: button.callback,
    }))
  ),
});

const sendMediaGroup = async (chatId, imagePaths) => {
  const form = new FormData();
  form.append('chat_id', `${chatId}`);

  const media = imagePaths.map((imagePath, index) => ({
    type: 'photo',
    media: `attach://file${index}`,
  }));

  form.append('media', JSON.stringify(media));

  imagePaths.forEach((imagePath, index) => {
    const bytes = fs.readFileSync(imagePath);
    form.append(
      `file${index}`,
      new Blob([bytes], { type: 'image/png' }),
      path.basename(imagePath)
    );
  });

  const response = await fetch(`${API_BASE}/sendMediaGroup`, {
    method: 'POST',
    body: form,
  });

  const json = await response.json();
  if (!json.ok) {
    throw new Error(json.description || 'Telegram sendMediaGroup failed');
  }

  return json.result;
};

const getSession = (chatId) => sessions.get(chatId) || null;

const setSession = (chatId, session) => {
  sessions.set(chatId, session);
  return session;
};

const clearSession = (chatId) => {
  sessions.delete(chatId);
};

const createSession = (chatId, initialRequest = '') => ({
  chatId,
  step: FLOW_STEP.chooseCompany,
  company: null,
  contentType: null,
  imageStyle: null,
  cardCount: null,
  language: 'both',
  topic: '',
  initialRequest,
  initialTopic: extractTopicCandidate(initialRequest),
  jobId: null,
});

const companyButtons = () =>
  buildInlineKeyboard([
    ...chunk(Object.keys(BRANDS), 2).map((row) =>
      row.map((id) => ({
        text: BRANDS[id].shortName,
        callback: `${CALLBACK.company}${id}`,
      }))
    ),
    [{ text: 'Cancel', callback: CALLBACK.cancelWizard }],
  ]);

const contentTypeButtons = () => {
  const types = Object.values(CONTENT_TYPES);
  const rows = [];
  for (let i = 0; i < types.length; i += 2) {
    rows.push(
      types.slice(i, i + 2).map((entry) => ({
        text: entry.label,
        callback: `${CALLBACK.type}${entry.id}`,
      }))
    );
  }
  rows.push([{ text: 'Cancel', callback: CALLBACK.cancelWizard }]);
  return buildInlineKeyboard(rows);
};

const imageStyleButtons = () => {
  const photoStyles = Object.values(IMAGE_STYLES).filter((s) => !s.id.startsWith('editorial_'));
  return buildInlineKeyboard([
    photoStyles.slice(0, 2).map((entry) => ({
      text: entry.label,
      callback: `${CALLBACK.style}${entry.id}`,
    })),
    photoStyles.slice(2, 4).map((entry) => ({
      text: entry.label,
      callback: `${CALLBACK.style}${entry.id}`,
    })),
    [{ text: IMAGE_STYLES.ultra_realistic.label, callback: `${CALLBACK.style}ultra_realistic` }],
    [{ text: '📋 Slides Informativos', callback: `${CALLBACK.style}slides_informativos` }],
    [{ text: 'Cancel', callback: CALLBACK.cancelWizard }],
  ]);
};

const editorialColorButtons = () =>
  buildInlineKeyboard([
    [
      { text: '☀️ Light', callback: `${CALLBACK.style}editorial_light` },
      { text: '🌑 Dark', callback: `${CALLBACK.style}editorial_dark` },
    ],
    [
      { text: '⚡ Mix', callback: `${CALLBACK.style}editorial_mix` },
      { text: '✨ Surpreenda-me', callback: `${CALLBACK.style}editorial_surprise` },
    ],
    [{ text: 'Cancel', callback: CALLBACK.cancelWizard }],
  ]);

const cardCountButtons = () =>
  buildInlineKeyboard([
    CARD_COUNT_OPTIONS.map((count) => ({
      text: `${count} cards`,
      callback: `${CALLBACK.count}${count}`,
    })),
    [{ text: 'Cancel', callback: CALLBACK.cancelWizard }],
  ]);

const languageButtons = () =>
  buildInlineKeyboard([
    [
      { text: '🌎 Bilíngue  (PT + EN)', callback: `${CALLBACK.language}both` },
    ],
    [
      { text: '🇧🇷 Português', callback: `${CALLBACK.language}pt` },
      { text: '🇺🇸 English', callback: `${CALLBACK.language}en` },
    ],
    [{ text: 'Cancel', callback: CALLBACK.cancelWizard }],
  ]);

const topicButtons = (session) => {
  const rows = [];

  if (session.initialTopic) {
    rows.push([
      {
        text: `Use: ${session.initialTopic.slice(0, 30)}`,
        callback: `${CALLBACK.topic}initial`,
      },
    ]);
  }

  if (session.company === 'thiagaoai') {
    rows.push([
      {
        text: "Use today's news",
        callback: `${CALLBACK.topic}daily-news`,
      },
    ]);
  }

  rows.push([{ text: 'Cancel', callback: CALLBACK.cancelWizard }]);
  return buildInlineKeyboard(rows);
};

const previewButtons = (jobId) =>
  buildInlineKeyboard([
    [{ text: 'Approve & Post', callback: `${CALLBACK.approve}${jobId}` }],
    [{ text: 'Regenerate Images', callback: `${CALLBACK.regenImg}${jobId}` }],
    [{ text: 'Regenerate Storytelling', callback: `${CALLBACK.regenStory}${jobId}` }],
    [{ text: 'Cancel', callback: `${CALLBACK.cancelJob}${jobId}` }],
  ]);

const startConversation = async (chatId, initialRequest = '') => {
  const session = createSession(chatId, initialRequest);
  setSession(chatId, session);

  const lines = [
    'Agente Mídia pronto — gerenciador e criador de mídia.',
    `PostForMe Instagram: ${instagramHandle}`,
    '',
    'Passo 1/6: escolha a empresa.',
  ];

  if (session.initialTopic) {
    lines.push('', `Initial request detected: ${session.initialTopic}`);
  }

  await sendMessage(chatId, lines.join('\n'), companyButtons());
};

const sendTopicPrompt = async (chatId, session) => {
  if (session.company === 'thiagaoai') {
    const lines = [
      'Passo 2/6: qual é o assunto?',
      'Clique em "Notícia do dia" ou digite o tema:',
    ];
    if (session.initialTopic) {
      lines.push('', `Sugestão: ${session.initialTopic}`);
    }
    await sendMessage(chatId, lines.join('\n'), topicButtons(session));
    return;
  }

  const lines = ['Passo 2/6: qual é o assunto do carrossel?'];
  if (session.initialTopic) {
    lines.push(`Sugestão: "${session.initialTopic}"`);
    lines.push('Digite abaixo (ou edite a sugestão) e pressione enviar 👇');
  } else {
    lines.push('Ex: renovação de pátio, cozinha moderna, dica de IA...');
    lines.push('Digite o tema e pressione enviar 👇');
  }
  lines.push('/cancel para cancelar');

  await sendMessage(chatId, lines.join('\n'), {
    force_reply: true,
    input_field_placeholder: 'Ex: renovação de pátio no Cape Cod...',
  });
};

const renderAndPreview = async (chatId, session, mode = 'full') => {
  if (!session.company || !session.contentType) {
    clearSession(chatId);
    await sendMessage(chatId, 'Sessão incompleta. Envie /carousel para recomeçar.');
    return;
  }

  const notice =
    mode === 'images'
      ? 'Regenerando imagens e gerando preview...'
      : mode === 'story'
        ? 'Regenerando storytelling, imagens e preview...'
        : 'Gerando storytelling, prompts, imagens e preview...';

  await sendMessage(chatId, notice);

  let job = session.jobId ? await engine.getJob(session.jobId) : null;

  if (!job) {
    job = await engine.createDraft({
      company: session.company,
      contentType: session.contentType,
      imageStyle: session.imageStyle,
      cardCount: session.cardCount,
      language: session.language || 'both',
      topic: session.topic,
      initialRequest: session.initialRequest,
      instagramHandle,
    });
    session.jobId = job.id;
  } else {
    job.company = session.company;
    job.contentType = session.contentType;
    job.imageStyle = session.imageStyle;
    job.cardCount = session.cardCount;
    job.topic = session.topic;
    job.initialRequest = session.initialRequest;
  }

  const result =
    mode === 'images'
      ? await engine.regenerateImages(job)
      : mode === 'story'
        ? await engine.regenerateStory(job)
        : await engine.generate(job);

  await sendMediaGroup(
    chatId,
    result.cards
      .slice()
      .sort((left, right) => left.index - right.index)
      .map((card) => card.path)
  );

  const summary = [
    'Preview ready for approval.',
    '',
    engine.summarize(result),
    result.researchProvider ? '' : null,
    result.researchProvider ? `Provider: ${result.researchProvider}` : null,
    result.newsHeadline ? `Headline: ${result.newsHeadline}` : null,
    result.newsSummary ? `Summary: ${result.newsSummary}` : null,
    result.editorialAngle ? `Angle: ${result.editorialAngle}` : null,
    result.sourceUrls && result.sourceUrls.length ? `Sources: ${result.sourceUrls.join(', ')}` : null,
    '',
    'Suggested caption:',
    result.caption,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const message = await sendMessage(chatId, summary, previewButtons(result.id));

  session.step = FLOW_STEP.previewReview;
  await engine.markPreviewMessage(result, message.message_id);
};

const handleTextMessage = async (message) => {
  if (!message.text) {
    return;
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (!isAllowedChat(chatId)) {
    return;
  }

  if (text === '/start' || text === '/help') {
    await startConversation(chatId);
    return;
  }

  if (text === '/carousel' || text === '/carrossel') {
    await startConversation(chatId);
    return;
  }

  if (NATURAL_START_PATTERN.test(text)) {
    clearSession(chatId);
    await startConversation(chatId, text);
    return;
  }

  if (text === '/cancel') {
    const session = getSession(chatId);
    if (session && session.jobId) {
      const job = await engine.getJob(session.jobId);
      if (job) {
        await engine.cancel(job, 'Cancelled from Telegram command');
      }
    }

    clearSession(chatId);
    await sendMessage(chatId, 'Fluxo cancelado. Envie /carousel ou descreva em linguagem natural para recomeçar.');
    return;
  }

  if (text === '/status') {
    const session = getSession(chatId);
    if (!session) {
      await sendMessage(chatId, 'Nenhum fluxo ativo. Envie /carousel para começar.');
      return;
    }

    const job = session.jobId ? await engine.getJob(session.jobId) : null;
    const status = job ? engine.summarize(job) : `Current step: ${session.step}`;
    await sendMessage(chatId, status);
    return;
  }

  let session = getSession(chatId);

  if (!session) {
    await startConversation(chatId, text);
    return;
  }

  if (session.step === FLOW_STEP.captureTopic) {
    session.topic = text;
    session.step = FLOW_STEP.chooseContentType;
    await sendMessage(chatId, 'Passo 3/6: tipo de conteúdo?', contentTypeButtons());
    return;
  }

  if (session.step === FLOW_STEP.previewReview) {
    await sendMessage(
      chatId,
      'Use os botões de aprovação abaixo do preview. Envie /carousel para iniciar um novo pedido.'
    );
    return;
  }

  await sendMessage(chatId, 'Use the buttons to continue this flow, or send /cancel to reset.');
};

const handleCallbackQuery = async (callbackQuery) => {
  const chatId = callbackQuery.message && callbackQuery.message.chat && callbackQuery.message.chat.id;
  const data = callbackQuery.data || '';

  if (!chatId || !isAllowedChat(chatId)) {
    return;
  }

  let session = getSession(chatId);

  if (data === CALLBACK.cancelWizard) {
    if (session && session.jobId) {
      const job = await engine.getJob(session.jobId);
      if (job) {
        await engine.cancel(job, 'Wizard cancelled');
      }
    }

    clearSession(chatId);
    await answerCallbackQuery(callbackQuery.id, 'Flow cancelled');
    await sendMessage(chatId, 'Flow cancelled. Send /carousel or a natural-language request to start again.');
    return;
  }

  if (!session) {
    const isJobAction =
      data.startsWith(CALLBACK.approve) ||
      data.startsWith(CALLBACK.regenImg) ||
      data.startsWith(CALLBACK.regenStory) ||
      data.startsWith(CALLBACK.cancelJob);

    if (data.startsWith(CALLBACK.company)) {
      session = createSession(chatId, '');
      setSession(chatId, session);
    } else if (!isJobAction) {
      await answerCallbackQuery(callbackQuery.id, 'Sessão expirada');
      await sendMessage(chatId, 'Sessão expirada. Envie /carousel para recomeçar.');
      return;
    }
  }

  if (data.startsWith(CALLBACK.company)) {
    session.company = data.slice(CALLBACK.company.length);
    session.step = FLOW_STEP.captureTopic;
    await answerCallbackQuery(callbackQuery.id, 'Company selected');
    await sendTopicPrompt(chatId, session);
    return;
  }

  if (data.startsWith(CALLBACK.type)) {
    session.contentType = data.slice(CALLBACK.type.length);
    session.step = FLOW_STEP.chooseImageStyle;
    await answerCallbackQuery(callbackQuery.id, 'Content type selected');
    await sendMessage(chatId, 'Passo 4/6: estilo das imagens?', imageStyleButtons());
    return;
  }

  if (data.startsWith(CALLBACK.style)) {
    const chosenStyle = data.slice(CALLBACK.style.length);
    if (chosenStyle === 'slides_informativos') {
      await answerCallbackQuery(callbackQuery.id, 'Slides Informativos');
      await sendMessage(chatId, 'Escolha o estilo visual dos slides:', editorialColorButtons());
      return;
    }
    session.imageStyle = chosenStyle;
    session.step = FLOW_STEP.chooseCardCount;
    await answerCallbackQuery(callbackQuery.id, 'Estilo selecionado');
    await sendMessage(chatId, 'Passo 5/6: quantos cards?', cardCountButtons());
    return;
  }

  if (data.startsWith(CALLBACK.count)) {
    session.cardCount = Number(data.slice(CALLBACK.count.length));
    session.step = FLOW_STEP.chooseLanguage;
    await answerCallbackQuery(callbackQuery.id, 'Card count selected');
    await sendMessage(chatId, 'Passo 6/6: idioma da legenda?\nAs imagens são sempre em inglês — isso afeta só a descrição do post.', languageButtons());
    return;
  }

  if (data.startsWith(CALLBACK.language)) {
    session.language = data.slice(CALLBACK.language.length);
    session.step = FLOW_STEP.previewReview;
    await answerCallbackQuery(callbackQuery.id, 'Language selected');
    await renderAndPreview(chatId, session, 'full');
    return;
  }

  if (data === `${CALLBACK.topic}initial`) {
    session.topic = session.initialTopic || session.initialRequest || 'carousel strategy';
    session.step = FLOW_STEP.chooseContentType;
    await answerCallbackQuery(callbackQuery.id, 'Using initial request');
    await sendMessage(chatId, 'Passo 3/6: tipo de conteúdo?', contentTypeButtons());
    return;
  }

  if (data === `${CALLBACK.topic}daily-news`) {
    session.topic = 'daily news editorial for @thiagaoai';
    session.step = FLOW_STEP.chooseContentType;
    await answerCallbackQuery(callbackQuery.id, "Using today's news");
    await sendMessage(chatId, 'Passo 3/6: tipo de conteúdo?', contentTypeButtons());
    return;
  }

  if (data.startsWith(CALLBACK.approve)) {
    const jobId = data.slice(CALLBACK.approve.length);
    const job = await engine.getJob(jobId);
    await answerCallbackQuery(callbackQuery.id, 'Publishing now');
    const result = await engine.approveAndPost(job);
    clearSession(chatId);
    await sendMessage(
      chatId,
      [
        'Publicado no Instagram.',
        `Instagram: ${job.instagramHandle}`,
        result.instagramUrl ? `URL: ${result.instagramUrl}` : 'URL: pending from PostForMe',
        result.postformeId ? `PostForMe ID: ${result.postformeId}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    );
    return;
  }

  if (data.startsWith(CALLBACK.regenImg)) {
    const jobId = data.slice(CALLBACK.regenImg.length);
    const job = await engine.getJob(jobId);
    session = session || createSession(chatId, job.initialRequest || '');
    session.company = job.company;
    session.contentType = job.contentType;
    session.imageStyle = job.imageStyle;
    session.cardCount = job.cardCount;
    session.topic = job.topic;
    session.jobId = job.id;
    setSession(chatId, session);
    await answerCallbackQuery(callbackQuery.id, 'Regenerating images');
    await renderAndPreview(chatId, session, 'images');
    return;
  }

  if (data.startsWith(CALLBACK.regenStory)) {
    const jobId = data.slice(CALLBACK.regenStory.length);
    const job = await engine.getJob(jobId);
    session = session || createSession(chatId, job.initialRequest || '');
    session.company = job.company;
    session.contentType = job.contentType;
    session.imageStyle = job.imageStyle;
    session.cardCount = job.cardCount;
    session.topic = job.topic;
    session.jobId = job.id;
    setSession(chatId, session);
    await answerCallbackQuery(callbackQuery.id, 'Regenerating storytelling');
    await renderAndPreview(chatId, session, 'story');
    return;
  }

  if (data.startsWith(CALLBACK.cancelJob)) {
    const jobId = data.slice(CALLBACK.cancelJob.length);
    const job = await engine.getJob(jobId);
    if (job) {
      await engine.cancel(job, 'Cancelled from preview screen');
    }
    clearSession(chatId);
    await answerCallbackQuery(callbackQuery.id, 'Job cancelled');
    await sendMessage(chatId, 'Job cancelado. Envie /carousel para começar outro.');
  }
};

const handleUpdate = async (update) => {
  if (update.message) {
    await handleTextMessage(update.message);
    return;
  }

  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
  }
};

const deleteWebhook = async () => {
  await apiCall('deleteWebhook', { drop_pending_updates: true });
};

const poll = async () => {
  let offset = 0;

  await deleteWebhook();
  console.log('Agente Mídia iniciado — gerenciador e criador de conteúdo.');

  while (true) {
    try {
      const updates = await apiCall('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message', 'callback_query'],
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        try {
          await handleUpdate(update);
        } catch (error) {
          console.error(`Update handling error: ${error.message}`);

          const targetChatId =
            (update.message && update.message.chat && update.message.chat.id) ||
            (update.callback_query &&
              update.callback_query.message &&
              update.callback_query.message.chat &&
              update.callback_query.message.chat.id);

          if (targetChatId && isAllowedChat(targetChatId)) {
            await sendMessage(
              targetChatId,
              `Flow failed: ${error.message}\nSend /carousel to try again.`
            ).catch(() => {});
          }
        }
      }
    } catch (error) {
      console.error(`Polling error: ${error.message}`);
      await sleep(3000);
    }
  }
};

if (require.main === module) {
  poll().catch((error) => {
    console.error(`Fatal bot error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  FLOW_STEP,
  startConversation,
  handleTextMessage,
  handleCallbackQuery,
  buildInlineKeyboard,
  sendMediaGroup,
  poll,
};
