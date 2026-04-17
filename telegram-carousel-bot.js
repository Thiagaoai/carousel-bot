require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {
  BRANDS,
  FLOW_TYPES,
  normalizeInstagramHandle,
  renderCarousel,
} = require('./telegram-carousel-core');

const token =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.TELEGRAM_TOKEN ||
  process.env.ELEGRAM_BOT_TOKEN;
const allowedChatId = process.env.TELEGRAM_CHAT_ID || null;
const instagramHandle = normalizeInstagramHandle(
  process.env.INSTAGRAM_HANDLE || process.env.POSTFORME_INSTAGRAM_HANDLE || '@thiagaoai'
);

if (!token) {
  console.error(
    'Missing Telegram bot token. Set TELEGRAM_BOT_TOKEN, TELEGRAM_TOKEN, or ELEGRAM_BOT_TOKEN in .env'
  );
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${token}`;
const state = new Map();

const COMPANY_OPTIONS = Object.keys(BRANDS);

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

const sendMessage = (chatId, text) =>
  apiCall('sendMessage', {
    chat_id: chatId,
    text,
  });

const sendVideo = async (chatId, filePath, caption) => {
  const form = new FormData();
  const buffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);

  form.append('chat_id', `${chatId}`);
  form.append('caption', caption);
  form.append('video', new Blob([buffer], { type: 'video/mp4' }), filename);

  const response = await fetch(`${API_BASE}/sendVideo`, {
    method: 'POST',
    body: form,
  });

  const json = await response.json();
  if (!json.ok) {
    throw new Error(json.description || 'Telegram sendVideo failed');
  }

  return json.result;
};

const isAllowedChat = (chatId) => {
  if (!allowedChatId) {
    return true;
  }

  return `${chatId}` === `${allowedChatId}`;
};

const resetConversation = (chatId) => {
  state.delete(chatId);
};

const startConversation = async (chatId) => {
  state.set(chatId, {
    step: 'company',
    flow: {},
  });

  await sendMessage(
    chatId,
    [
      'Carousel creator ready.',
      `PostForMe Instagram: ${instagramHandle}`,
      '',
      'Send one company slug:',
      COMPANY_OPTIONS.map((company) => `- ${company}`).join('\n'),
      '',
      'Commands:',
      '/carousel start the flow',
      '/cancel reset the flow',
      '/help show help',
    ].join('\n')
  );
};

const promptForType = (chatId) =>
  sendMessage(
    chatId,
    [
      'Choose a content type:',
      '- testimonial',
      '- tips',
      '- promo',
    ].join('\n')
  );

const applyStep = async (chatId, text) => {
  const entry = state.get(chatId);

  if (!entry) {
    await sendMessage(chatId, 'Send /carousel to start.');
    return;
  }

  const value = text.trim();

  if (entry.step === 'company') {
    if (!BRANDS[value]) {
      await sendMessage(chatId, 'Invalid company slug. Send one of the listed options.');
      return;
    }

    entry.flow.company = value;
    entry.flow.instagramHandle = instagramHandle;
    entry.step = 'type';
    await promptForType(chatId);
    return;
  }

  if (entry.step === 'type') {
    if (!Object.values(FLOW_TYPES).includes(value)) {
      await sendMessage(chatId, 'Invalid type. Use testimonial, tips, or promo.');
      return;
    }

    entry.flow.type = value;

    if (value === FLOW_TYPES.testimonial) {
      entry.step = 'quote';
      await sendMessage(chatId, 'Send the testimonial quote.');
      return;
    }

    if (value === FLOW_TYPES.tips) {
      entry.step = 'mainTitle';
      await sendMessage(chatId, 'Send the main title for the tips carousel.');
      return;
    }

    entry.step = 'offerTitle';
    await sendMessage(chatId, 'Send the promo title.');
    return;
  }

  if (entry.step === 'quote') {
    entry.flow.quote = value;
    entry.step = 'customerName';
    await sendMessage(chatId, 'Send the customer name.');
    return;
  }

  if (entry.step === 'customerName') {
    entry.flow.customerName = value;
    entry.step = 'customerTitle';
    await sendMessage(chatId, 'Send the customer title, or type skip.');
    return;
  }

  if (entry.step === 'customerTitle') {
    entry.flow.customerTitle = value.toLowerCase() === 'skip' ? '' : value;
    entry.step = 'ctaText';
    await sendMessage(chatId, 'Send the CTA text, or type skip.');
    return;
  }

  if (entry.step === 'ctaText') {
    entry.flow.ctaText = value.toLowerCase() === 'skip' ? '' : value;
    await finalizeRender(chatId, entry.flow);
    return;
  }

  if (entry.step === 'mainTitle') {
    entry.flow.mainTitle = value;
    entry.flow.tips = [];
    entry.step = 'tip1';
    await sendMessage(chatId, 'Send tip 1 as: title | description');
    return;
  }

  if (entry.step === 'tip1' || entry.step === 'tip2' || entry.step === 'tip3') {
    const [title, description] = value.split('|').map((part) => part && part.trim());

    if (!title || !description) {
      await sendMessage(chatId, 'Use this format exactly: title | description');
      return;
    }

    const icons = ['🌱', '💡', '📈'];
    entry.flow.tips.push({
      icon: icons[entry.flow.tips.length] || '•',
      title,
      description,
    });

    if (entry.step === 'tip1') {
      entry.step = 'tip2';
      await sendMessage(chatId, 'Send tip 2 as: title | description');
      return;
    }

    if (entry.step === 'tip2') {
      entry.step = 'tip3';
      await sendMessage(chatId, 'Send tip 3 as: title | description');
      return;
    }

    entry.step = 'tipsCtaText';
    await sendMessage(chatId, 'Send the CTA headline, or type skip.');
    return;
  }

  if (entry.step === 'tipsCtaText') {
    entry.flow.ctaText = value.toLowerCase() === 'skip' ? '' : value;
    entry.step = 'tipsCtaAction';
    await sendMessage(chatId, 'Send the CTA button text, or type skip.');
    return;
  }

  if (entry.step === 'tipsCtaAction') {
    entry.flow.ctaAction = value.toLowerCase() === 'skip' ? '' : value;
    await finalizeRender(chatId, entry.flow);
    return;
  }

  if (entry.step === 'offerTitle') {
    entry.flow.offerTitle = value;
    entry.step = 'offerDetail';
    await sendMessage(chatId, 'Send the promo detail.');
    return;
  }

  if (entry.step === 'offerDetail') {
    entry.flow.offerDetail = value;
    entry.step = 'offerValue';
    await sendMessage(chatId, 'Send the promo value, or type skip.');
    return;
  }

  if (entry.step === 'offerValue') {
    entry.flow.offerValue = value.toLowerCase() === 'skip' ? '' : value;
    entry.step = 'promoCta';
    await sendMessage(chatId, 'Send the CTA text, or type skip.');
    return;
  }

  if (entry.step === 'promoCta') {
    entry.flow.ctaText = value.toLowerCase() === 'skip' ? '' : value;
    entry.step = 'contactInfo';
    await sendMessage(chatId, 'Send the contact info. Example: (508) 464-4878');
    return;
  }

  if (entry.step === 'contactInfo') {
    entry.flow.contactInfo = value;
    await finalizeRender(chatId, entry.flow);
  }
};

const finalizeRender = async (chatId, flow) => {
  await sendMessage(chatId, 'Rendering now. This can take around 15-30 seconds.');

  try {
    const result = await renderCarousel(flow);
    await sendVideo(chatId, result.outputPath, result.caption);
    await sendMessage(
      chatId,
      [
        'Done.',
        `Composition: ${result.composition}`,
        `Instagram: ${result.instagramHandle}`,
        `File: ${path.relative(process.cwd(), result.outputPath)}`,
        'Send /carousel to create another one.',
      ].join('\n')
    );
  } catch (error) {
    await sendMessage(chatId, `Render failed: ${error.message}`);
  } finally {
    resetConversation(chatId);
  }
};

const handleUpdate = async (update) => {
  const message = update.message;
  if (!message || !message.text) {
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

  if (text === '/carousel') {
    await startConversation(chatId);
    return;
  }

  if (text === '/cancel') {
    resetConversation(chatId);
    await sendMessage(chatId, 'Flow cancelled. Send /carousel to start again.');
    return;
  }

  if (text === '/status') {
    const current = state.get(chatId);
    await sendMessage(
      chatId,
      current
        ? `Current step: ${current.step}`
        : 'No active flow. Send /carousel to start.'
    );
    return;
  }

  await applyStep(chatId, text);
};

const deleteWebhook = async () => {
  await apiCall('deleteWebhook', { drop_pending_updates: true });
};

const poll = async () => {
  let offset = 0;

  await deleteWebhook();
  console.log('Telegram carousel bot started.');

  while (true) {
    try {
      const updates = await apiCall('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message'],
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        await handleUpdate(update);
      }
    } catch (error) {
      console.error(`Polling error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

poll().catch((error) => {
  console.error(`Fatal bot error: ${error.message}`);
  process.exit(1);
});
