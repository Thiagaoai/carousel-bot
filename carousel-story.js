const { BRANDS, CONTENT_TYPES, IMAGE_STYLES } = require('./carousel-config');

const STORYBOARD_INDEXES = {
  3: [0, 3, 6],
  5: [0, 1, 3, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

const truncateTopic = (topic) => {
  if (!topic) {
    return 'essa ideia';
  }

  return topic.length > 60 ? `${topic.slice(0, 57).trim()}...` : topic;
};

const createCard = (headline, body, layoutType, visual, eyebrow, cta) => ({
  headline,
  body,
  layoutType,
  visual,
  eyebrow,
  cta: cta || null,
});

const isThiagaoAi = (request) => request.company === 'thiagaoai';

const getResearchHeadline = (request) =>
  (request.newsHeadline || (request.researchContext && request.topic) || request.topic || '').trim();

const getResearchSummary = (request) =>
  (
    request.newsSummary ||
    (request.researchContext ? request.researchContext.split('\n')[2] : '') ||
    request.topic ||
    ''
  ).trim();

const getEditorialAngle = (request) =>
  (request.editorialAngle || 'Traga um angulo pratico, com execucao, ROI e proposito.').trim();

const buildBeforeAfter = (topic, brand) => [
  createCard(
    'ANTES X DEPOIS',
    `Como ${truncateTopic(topic)} sai do comum e vira um caso que chama atencao no feed.`,
    'cover',
    `hero transformation around ${topic}`,
    brand.shortName
  ),
  createCard(
    'O CENARIO ANTES',
    `O problema era simples: visual sem impacto, pouca clareza e nenhuma sensacao de valor imediato.`,
    'split',
    `the before state of ${topic}, muted and underwhelming`,
    'Antes'
  ),
  createCard(
    'O PONTO DE VIRADA',
    `Quando o processo fica intencional, o publico percebe qualidade, cuidado e autoridade.`,
    'insight',
    `the turning point of a premium ${brand.industry} project about ${topic}`,
    'Virada'
  ),
  createCard(
    'O QUE MUDOU',
    `Design, narrativa e apresentacao alinhados para mostrar resultado de forma clara e convincente.`,
    'checklist',
    `step by step transformation process for ${topic}`,
    'Processo'
  ),
  createCard(
    'O RESULTADO FINAL',
    `Apos a transformacao, tudo comunica mais confianca, mais valor e mais desejo de fechar negocio.`,
    'showcase',
    `the polished after state for ${topic}, premium and aspirational`,
    'Depois'
  ),
  createCard(
    'POR QUE ISSO FUNCIONA',
    `As pessoas compram o impacto que conseguem enxergar. Resultado visivel gera resposta rapida.`,
    'proof',
    `audience reacting to a striking visual result for ${topic}`,
    'Impacto'
  ),
  createCard(
    'QUER O SEU DEPOIS?',
    `${brand.cta}. O proximo case forte pode ser o seu.`,
    'cta',
    `a bold call to action scene for ${topic} with premium atmosphere`,
    'CTA',
    brand.cta
  ),
];

const buildTestimonial = (topic, brand) => [
  createCard(
    'O QUE DIZEM',
    `Quando ${truncateTopic(topic)} entrega experiencia de verdade, a prova social aparece sozinha.`,
    'cover',
    `a confident customer story around ${topic}`,
    brand.shortName
  ),
  createCard(
    'ANTES DA DECISAO',
    `A duvida era a mesma de sempre: escolher alguem que realmente entregue cuidado, prazo e acabamento.`,
    'insight',
    `customer thinking about choosing a ${brand.industry} provider for ${topic}`,
    'Contexto'
  ),
  createCard(
    'POR QUE ESCOLHERAM',
    `Clareza, confianca e uma apresentacao que passa seguranca desde o primeiro contato.`,
    'service',
    `trust-building interaction for ${topic}, premium brand impression`,
    'Escolha'
  ),
  createCard(
    'A FRASE QUE RESUME',
    `"A experiencia foi leve, o processo foi claro e o resultado superou a expectativa."`,
    'quote',
    `customer review moment for ${topic}, authentic and aspirational`,
    'Depoimento'
  ),
  createCard(
    'COMO FOI A ENTREGA',
    `Do briefing ao resultado final, cada etapa reforcou a sensacao de profissionalismo e atencao ao detalhe.`,
    'checklist',
    `high-touch service delivery for ${topic}`,
    'Experiencia'
  ),
  createCard(
    'O IMPACTO FINAL',
    `Quando a entrega fica memoravel, a indicacao e a recompra passam a acontecer com muito mais facilidade.`,
    'proof',
    `customer delighted with the final outcome of ${topic}`,
    'Resultado'
  ),
  createCard(
    'QUER ESSE NIVEL?',
    `${brand.cta}. Vamos transformar a sua proxima entrega em prova social real.`,
    'cta',
    `premium invitation to book ${brand.shortName} for ${topic}`,
    'CTA',
    brand.cta
  ),
];

const buildEducationalTips = (topic, brand) => [
  createCard(
    '3 A 7 DICAS QUE VALEM SALVAR',
    `Um carrossel rapido para transformar ${truncateTopic(topic)} em conteudo util e facil de compartilhar.`,
    'cover',
    `editorial educational scene about ${topic}`,
    brand.shortName
  ),
  createCard(
    'COMECE PELO DIAGNOSTICO',
    `Antes de criar qualquer peca, mostre o problema, o contexto e o que esta realmente travando o resultado.`,
    'insight',
    `strategic diagnosis scene for ${topic}`,
    'Dica 1'
  ),
  createCard(
    'DEIXE O PROCESSO VISIVEL',
    `As pessoas confiam mais quando enxergam etapas, criterios e logica por tras da solucao.`,
    'checklist',
    `clear process visualization for ${topic}`,
    'Dica 2'
  ),
  createCard(
    'TRAGA EXEMPLOS CONCRETOS',
    `Comparacoes, antes e depois, demos e provas reais fazem o publico entender valor mais rapido.`,
    'split',
    `concrete examples and proof points for ${topic}`,
    'Dica 3'
  ),
  createCard(
    'MANTENHA UMA IDEIA POR CARD',
    `Quando cada card entrega uma unica mensagem forte, o carrossel fica mais facil de ler e salvar.`,
    'service',
    `clean single-idea slide design for ${topic}`,
    'Dica 4'
  ),
  createCard(
    'FECHE COM DIRECAO',
    `Todo carrossel precisa terminar com uma proxima acao clara: comentar, salvar, pedir orcamento ou chamar no direct.`,
    'offer',
    `clear next-step call to action for ${topic}`,
    'Dica 5'
  ),
  createCard(
    'QUER MAIS CONTEUDO ASSIM?',
    `${brand.cta}. Se fizer sentido, salva este carrossel e manda pra quem precisa ver.`,
    'cta',
    `compelling final educational CTA for ${topic}`,
    'CTA',
    brand.cta
  ),
];

const buildPromoOffer = (topic, brand) => [
  createCard(
    'OFERTA COM IMPACTO',
    `Transforme ${truncateTopic(topic)} em uma oferta impossivel de ignorar no feed.`,
    'cover',
    `premium promotional concept for ${topic}`,
    brand.shortName
  ),
  createCard(
    'QUAL E A OFERTA',
    `O publico precisa entender em segundos o que esta ganhando e por que agir agora faz sentido.`,
    'offer',
    `high-converting promotional offer for ${topic}`,
    'Oferta'
  ),
  createCard(
    'QUAL DOR RESOLVE',
    `A oferta so vende quando conversa com um problema real, urgente e facil de reconhecer.`,
    'insight',
    `problem-solution visual for ${topic}`,
    'Dor'
  ),
  createCard(
    'O BENEFICIO CENTRAL',
    `Em vez de listar tudo, destaque o ganho que muda a decisao: tempo, dinheiro, praticidade ou status.`,
    'service',
    `hero benefit visualization for ${topic}`,
    'Beneficio'
  ),
  createCard(
    'CRIE URGENCIA REAL',
    `Prazo, agenda limitada ou condicao especial ajudam a mover quem estava parado.`,
    'proof',
    `urgency-driven promo scene for ${topic}`,
    'Urgencia'
  ),
  createCard(
    'PROVE QUE ENTREGA',
    `Oferta sem credibilidade parece barulho. Oferta com prova parece oportunidade.`,
    'quote',
    `trust and proof elements supporting a promo for ${topic}`,
    'Prova'
  ),
  createCard(
    'PRONTO PARA APROVEITAR?',
    `${brand.cta}. Aproveite o momento certo para colocar isso em movimento.`,
    'cta',
    `bold final sales CTA for ${topic}`,
    'CTA',
    brand.cta
  ),
];

const buildServiceShowcase = (topic, brand) => [
  createCard(
    'O QUE NOS FAZ DIFERENTES',
    `Um panorama rapido de como ${truncateTopic(topic)} pode ser apresentado com mais clareza e valor.`,
    'cover',
    `service showcase hero scene for ${topic}`,
    brand.shortName
  ),
  createCard(
    'ESTRATEGIA',
    `Tudo comeca pela leitura certa do objetivo, do publico e da transformacao que o carrossel precisa comunicar.`,
    'service',
    `strategy planning scene for ${topic}`,
    'Servico 1'
  ),
  createCard(
    'CRIACAO',
    `Storytelling, prompts e direcao visual andam juntos para cada card parecer pensado e profissional.`,
    'service',
    `creative development scene for ${topic}`,
    'Servico 2'
  ),
  createCard(
    'IMAGENS',
    `A imagem precisa sustentar a promessa do card, nao competir com a mensagem principal.`,
    'showcase',
    `image direction and premium art creation for ${topic}`,
    'Servico 3'
  ),
  createCard(
    'APRESENTACAO',
    `Design forte organiza a informacao, guia o olhar e aumenta a chance de salvamento e compartilhamento.`,
    'insight',
    `high-end editorial layout presentation for ${topic}`,
    'Servico 4'
  ),
  createCard(
    'PUBLICACAO',
    `Quando o fluxo fecha em preview + aprovacao + postagem, o conteudo deixa de ser promessa e vira sistema.`,
    'checklist',
    `publishing workflow scene for ${topic}`,
    'Servico 5'
  ),
  createCard(
    'VAMOS MONTAR O SEU?',
    `${brand.cta}. O objetivo agora e sair do rascunho e entrar em execucao.`,
    'cta',
    `final invitation to start a premium carousel project about ${topic}`,
    'CTA',
    brand.cta
  ),
];

const buildFullStoryboard = (request) => {
  if (isThiagaoAi(request)) {
    return buildAINewsStoryboard(request);
  }

  const brand = BRANDS[request.company];
  const topic = truncateTopic(request.topic);

  switch (request.contentType) {
    case CONTENT_TYPES.before_after.id:
      return buildBeforeAfter(topic, brand);
    case CONTENT_TYPES.testimonial.id:
      return buildTestimonial(topic, brand);
    case CONTENT_TYPES.educational_tips.id:
      return buildEducationalTips(topic, brand);
    case CONTENT_TYPES.promo_offer.id:
      return buildPromoOffer(topic, brand);
    case CONTENT_TYPES.service_showcase.id:
      return buildServiceShowcase(topic, brand);
    default:
      throw new Error(`Unsupported content type: ${request.contentType}`);
  }
};

const buildAINewsStoryboard = (request) => {
  const brand = BRANDS[request.company];
  const headline = getResearchHeadline(request) || request.topic || 'AI news';
  const summary = getResearchSummary(request) || headline;
  const angle = getEditorialAngle(request);
  const topic = truncateTopic(headline);

  return [
    // Card 0 — cover
    createCard(
      topic.toUpperCase(),
      summary,
      'cover',
      `dramatic tech editorial magazine cover about "${topic}", futuristic AI technology, dark atmosphere with glowing data`,
      '@ThiagaoAI · IA'
    ),
    // Card 1 — o que aconteceu
    createCard(
      'O QUE ACONTECEU',
      summary,
      'insight',
      `news breaking moment in technology, journalists and screens showing AI announcements, realistic`,
      'Noticia'
    ),
    // Card 2 — quem esta por tras
    createCard(
      'QUEM ESTA POR TRAS',
      `As maiores empresas de tecnologia do mundo estao correndo para liderar a proxima era da Inteligencia Artificial.`,
      'service',
      `tech company headquarters, Silicon Valley, servers and engineers working on AI systems`,
      'Players'
    ),
    // Card 3 — o que mudou
    createCard(
      'O QUE MUDOU',
      angle,
      'checklist',
      `before and after visualization of AI technology advancement, comparison of old vs new capability`,
      'O que mudou'
    ),
    // Card 4 — como funciona
    createCard(
      'COMO FUNCIONA NA PRATICA',
      `${topic} nao e so tecnologia. E como pessoas e empresas vao trabalhar, criar e decidir daqui para frente.`,
      'split',
      `person using AI tools on a computer or smartphone, realistic professional setting, practical technology use`,
      'Na pratica'
    ),
    // Card 5 — o que voce pode fazer
    createCard(
      'O QUE VOCE PODE FAZER',
      `Quem entende o que esta acontecendo com IA hoje tem vantagem real. Conhecimento aplicado e diferencial competitivo.`,
      'proof',
      `professional person confident and empowered with technology, modern workspace with AI tools visible`,
      'Sua acao'
    ),
    // Card 6 — CTA
    createCard(
      'FICA POR DENTRO',
      `${brand.cta}. Noticias de IA todos os dias, sem enrolacao.`,
      'cta',
      `modern tech portrait scene, following social media notification, phone showing Instagram feed about AI news`,
      'CTA',
      brand.cta
    ),
  ];
};

const applyThiagaoAiEditorialOverlay = (cards, request) => {
  // thiagaoai uses buildAINewsStoryboard directly — no overlay needed
  return cards;
};

const buildImagePrompt = (card, request) => {
  const brand = BRANDS[request.company];
  const contentType = CONTENT_TYPES[request.contentType];
  const style = IMAGE_STYLES[request.imageStyle];

  return [
    `Create a premium 4:5 Instagram carousel image for ${brand.shortName}.`,
    `Topic: ${request.topic}.`,
    request.newsHeadline ? `News headline: ${request.newsHeadline}.` : null,
    request.newsSummary ? `News context: ${request.newsSummary}.` : null,
    request.editorialAngle ? `Editorial angle: ${request.editorialAngle}.` : null,
    `Content type: ${contentType.label}.`,
    `Scene goal: ${card.visual}.`,
    `Brand industry: ${brand.industry}.`,
    `Brand tone: ${brand.tone}.`,
    request.siteProfile && request.siteProfile.summary
      ? `Company site context: ${request.siteProfile.summary.slice(0, 300)}.`
      : null,
    request.researchContext ? `Research context: ${request.researchContext}.` : null,
    style.promptStyle,
    `Use ${brand.colors.primary} as the dominant accent and ${brand.colors.accent} as a highlight.`,
    'No text, no letters, no watermark, no logos, no split panels, no collage.',
  ]
    .filter(Boolean)
    .join(' ');
};

const CONTENT_LABELS_EN = {
  before_after: 'Before & After',
  testimonial: 'Client Testimonial',
  educational_tips: 'Tips & Insights',
  promo_offer: 'Special Offer',
  service_showcase: 'Our Services',
};

const CONTENT_LABELS_PT = {
  before_after: 'Antes e Depois',
  testimonial: 'Depoimento',
  educational_tips: 'Dicas',
  promo_offer: 'Promocao',
  service_showcase: 'Nossos Servicos',
};

const buildHashtags = (request) => {
  const brand = BRANDS[request.company];
  const pool = (brand.hashtagPool || []).slice(0, 8);

  const topicTags = (request.newsHeadline || request.topic || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  const typeTags = {
    before_after: ['BeforeAndAfter', 'Transformation'],
    testimonial: ['ClientStory', 'SocialProof'],
    educational_tips: ['TipsAndTricks', 'HowTo'],
    promo_offer: ['SpecialOffer', 'LimitedTime'],
    service_showcase: ['OurServices', 'WhatWeDo'],
  }[request.contentType] || [];

  return [...new Set([...pool, ...topicTags, ...typeTags])]
    .map((t) => `#${t}`)
    .join(' ');
};

const buildHighlights = (storyboard) =>
  storyboard
    .slice(1, Math.max(2, storyboard.length - 1))
    .slice(0, 3)
    .map((card) => `✔ ${card.headline.replace(/\n/g, ' ')}`)
    .join('\n');

const buildCaptionPT = (request, storyboard) => {
  const brand = BRANDS[request.company];
  const label = CONTENT_LABELS_PT[request.contentType] || CONTENT_TYPES[request.contentType].label;

  if (isThiagaoAi(request)) {
    return [
      `🤖 Noticia de IA — ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`,
      '',
      request.newsHeadline || request.topic,
      '',
      request.newsSummary || null,
      request.editorialAngle ? `\n💡 ${request.editorialAngle}` : null,
      '',
      request.sourceUrls && request.sourceUrls.length > 0 ? `📰 Fonte: ${request.sourceUrls[0]}` : null,
      '',
      brand.cta,
    ]
      .filter((line) => line !== null)
      .join('\n');
  }

  return [
    `🇧🇷 ${brand.shortName} | ${label}`,
    '',
    `Hoje o foco e ${request.topic}.`,
    '',
    buildHighlights(storyboard),
    '',
    `${brand.cta}.`,
  ]
    .filter((line) => line !== null)
    .join('\n');
};

const buildCaptionEN = (request, storyboard) => {
  const brand = BRANDS[request.company];
  const label = CONTENT_LABELS_EN[request.contentType] || 'Showcase';

  if (isThiagaoAi(request)) {
    return [
      `🤖 AI News — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
      '',
      request.newsHeadline || request.topic,
      '',
      request.newsSummary || null,
      request.editorialAngle ? `\n💡 ${request.editorialAngle}` : null,
      '',
      request.sourceUrls && request.sourceUrls.length > 0 ? `📰 Source: ${request.sourceUrls[0]}` : null,
      '',
      brand.ctaEN,
    ]
      .filter((line) => line !== null)
      .join('\n');
  }

  return [
    `🇺🇸 ${brand.shortName} | ${label}`,
    '',
    `Today's focus: ${request.topic}.`,
    '',
    buildHighlights(storyboard),
    '',
    `${brand.ctaEN || brand.cta}.`,
  ]
    .filter((line) => line !== null)
    .join('\n');
};

const buildCaption = (request, storyboard) => {
  const hashtags = buildHashtags(request);

  if (request.language === 'en') {
    return [buildCaptionEN(request, storyboard), '', hashtags].join('\n');
  }

  if (request.language === 'both') {
    return [
      buildCaptionEN(request, storyboard),
      '',
      '・ ・ ・',
      '',
      buildCaptionPT(request, storyboard),
      '',
      hashtags,
    ].join('\n');
  }

  return [buildCaptionPT(request, storyboard), '', hashtags].join('\n');
};

const createStoryboard = (request) => {
  const indexes = STORYBOARD_INDEXES[request.cardCount];
  if (!indexes) {
    throw new Error(`Unsupported card count: ${request.cardCount}`);
  }

  const fullStoryboard = applyThiagaoAiEditorialOverlay(buildFullStoryboard(request), request);
  const selected = indexes.map((index) => fullStoryboard[index]);

  const storyboard = selected.map((card, index) => ({
    index: index + 1,
    headline: card.headline,
    body: card.body,
    cta: card.cta,
    imagePrompt: buildImagePrompt(card, request),
    layoutType: card.layoutType,
    eyebrow: card.eyebrow,
    imagePath: null,
  }));

  return {
    storyboard,
    caption: buildCaption(request, storyboard),
  };
};

module.exports = {
  createStoryboard,
};
