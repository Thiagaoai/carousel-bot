const BRANDS = {
  roberts: {
    slug: 'roberts',
    name: 'Roberts Landscape Construction & Design',
    shortName: 'Roberts Landscape',
    industry: 'landscape construction and hardscape',
    colors: { primary: '#2D5016', secondary: '#8B7355', accent: '#F5A623' },
    font: 'Playfair Display',
    tone: 'trustworthy craftsmanship and local authority',
    cta: 'Peca um orcamento hoje',
    ctaEN: 'Request your free estimate today',
    siteUrl: 'https://robertslandscapecod.com',
    hashtagPool: [
      'LandscapeDesign', 'HardscapeContractor', 'CapeCodLandscape',
      'OutdoorLiving', 'PaverPatio', 'LandscapeTransformation',
      'CapeCod', 'NewEnglandLandscape', 'OutdoorDesign',
      'HardscapeDesign', 'PatioDesign', 'CurbAppeal',
      'BackyardGoals', 'DesignBuildLandscape', 'OutdoorSpaces',
      'MassachusettsLandscape', 'LandscapeContractor', 'WaterFeature',
    ],
  },
  cheesebread: {
    slug: 'cheesebread',
    name: 'Cheesebread Bakery Cafe',
    shortName: 'Cheesebread',
    industry: 'bakery and brazilian cafe',
    colors: { primary: '#D4A574', secondary: '#8B6F47', accent: '#FFE5CC' },
    font: 'Playfair Display',
    tone: 'warm artisanal hospitality',
    cta: 'Venha provar hoje',
    ctaEN: 'Come taste it today',
    hashtagPool: [
      'BrazilianBakery', 'CapeCodFood', 'BrazilianFood',
      'BakeryLife', 'CafeVibes', 'FreshBaked',
      'ArtisanBread', 'BrazilianCafe', 'BreakfastGoals',
      'FoodieCapeCod', 'PaoDeQueijo', 'BrazilianSweets',
      'CafeCulture', 'LocalEats', 'CapeCodeats',
      'MassFood', 'BrazilianKitchen', 'Padaria',
    ],
  },
  'cape-codder': {
    slug: 'cape-codder',
    name: 'Cape Codder Home Improvement',
    shortName: 'Cape Codder HI',
    industry: 'home improvement and remodeling',
    colors: { primary: '#0055A8', secondary: '#F8A100', accent: '#E8E8E8' },
    font: 'Montserrat',
    tone: 'reliable and solution-oriented professionalism',
    cta: 'Agende sua avaliacao',
    ctaEN: 'Schedule your free assessment today',
    hashtagPool: [
      'HomeImprovement', 'HomeRemodel', 'CapeCodHomes',
      'HomeRenovation', 'ContractorLife', 'KitchenRemodel',
      'BathroomRemodel', 'HomeTransformation', 'FixItRight',
      'NewEnglandHomes', 'HomeOwner', 'HomeUpgrade',
      'HouseGoals', 'InteriorDesign', 'MassachusettsHomes',
      'RemodelerLife', 'HomeDesign', 'ContractorOfInstagram',
    ],
  },
  'all-granite': {
    slug: 'all-granite',
    name: 'All Granite & Stone',
    shortName: 'All Granite',
    industry: 'stone fabrication and countertops',
    colors: { primary: '#4A4A4A', secondary: '#8B8B8B', accent: '#D4AF37' },
    font: 'Raleway',
    tone: 'premium sophistication and design confidence',
    cta: 'Marque sua consulta',
    ctaEN: 'Book your design consultation',
    siteUrl: 'https://allgraniteandstone.com',
    hashtagPool: [
      'GraniteCountertops', 'StoneCountertops', 'KitchenRemodel',
      'CountertopDesign', 'CustomGranite', 'MarbleCountertops',
      'QuartzCountertops', 'KitchenDesign', 'StoneDesign',
      'HomeRenovation', 'CapeCodKitchens', 'LuxuryKitchen',
      'GraniteAndStone', 'CustomKitchen', 'NaturalStone',
      'KitchenGoals', 'CountertopInstallation', 'StoneFabrication',
    ],
  },
  'dockplus-ai': {
    slug: 'dockplus-ai',
    name: 'DockPlus AI Solutions',
    shortName: 'DockPlus AI',
    industry: 'ai automation and digital growth',
    colors: { primary: '#1E1E2E', secondary: '#00FF00', accent: '#00FFFF' },
    font: 'JetBrains Mono',
    tone: 'bold technical credibility and speed',
    cta: 'Fale com a DockPlus AI',
    ctaEN: 'Talk to DockPlus AI today',
    siteUrl: 'https://dockplusai.com',
    hashtagPool: [
      'AIAutomation', 'SmallBusiness', 'DigitalMarketing',
      'BusinessGrowth', 'AIForBusiness', 'MarketingAutomation',
      'ContentCreation', 'SocialMediaMarketing', 'AITools',
      'InstagramMarketing', 'LocalBusiness', 'CapeCodBusiness',
      'GrowthHacking', 'Entrepreneur', 'MarketingStrategy',
      'BusinessAutomation', 'AIAgents', 'ContentStrategy',
    ],
  },
  thiagaoai: {
    slug: 'thiagaoai',
    name: 'Thiago do Carmo',
    shortName: 'ThiagaoAI',
    industry: 'artificial intelligence news, technology updates and innovation',
    colors: { primary: '#101820', secondary: '#1F5C4C', accent: '#D1A954' },
    font: 'Merriweather',
    tone: 'clear, factual and direct — breaking AI news explained simply for everyone',
    cta: 'Siga @thiagaoai para noticias de IA todo dia',
    ctaEN: 'Follow @thiagaoai for daily AI news',
    editorialMode: 'daily_news',
    siteUrl: process.env.THIAGODOCARMO_SITE_URL || 'https://thiagodocarmo.dev',
    hashtagPool: [
      'InteligenciaArtificial', 'ArtificialIntelligence', 'AINews',
      'MachineLearning', 'OpenAI', 'GoogleAI',
      'TechNews', 'AITools', 'FutureOfAI',
      'ChatGPT', 'AITechnology', 'TecnologiaAI',
      'NoticiaIA', 'InovacaoTech', 'AIUpdate',
      'ThiagaoAI', 'AIBrasil', 'DeepLearning',
    ],
    editorialProfile: {
      audience: 'curious people, professionals and entrepreneurs who want to understand AI and what it means for their world',
      voice: 'informative, clear and factual — turns complex AI news into simple, impactful explanations anyone can understand',
      pillars: [
        'breaking AI news: new models, releases and updates (ChatGPT, Claude, Gemini, Grok, etc.)',
        'what the latest AI means for businesses, jobs and everyday life',
        'AI tools and how to use them in practice',
        'AI regulation, ethics, safety and global impact',
      ],
    },
  },
};

const CONTENT_TYPES = {
  before_after: {
    id: 'before_after',
    label: 'Before / After',
    description: 'Mostrar transformacao visual e impacto',
  },
  testimonial: {
    id: 'testimonial',
    label: 'Depoimento',
    description: 'Prova social com narrativa de cliente',
  },
  educational_tips: {
    id: 'educational_tips',
    label: 'Dicas Educativas',
    description: 'Ensinar em formato rapido e salvavel',
  },
  promo_offer: {
    id: 'promo_offer',
    label: 'Oferta / Promo',
    description: 'Oferta com urgencia e CTA claro',
  },
  service_showcase: {
    id: 'service_showcase',
    label: 'Showcase do Servico',
    description: 'Explicar servicos e diferenciais',
  },
  how_it_works: {
    id: 'how_it_works',
    label: 'Como Funciona',
    description: 'Processo passo a passo do servico ou produto',
  },
  faq: {
    id: 'faq',
    label: 'FAQ',
    description: 'Perguntas frequentes respondidas de forma clara',
  },
  comparison: {
    id: 'comparison',
    label: 'Comparativo',
    description: 'Comparar opcoes, materiais ou abordagens',
  },
  behind_scenes: {
    id: 'behind_scenes',
    label: 'Bastidores',
    description: 'Historia da equipe, processo ou projeto real',
  },
  news_update: {
    id: 'news_update',
    label: 'Novidade / Lancamento',
    description: 'Anuncio de novo produto, servico ou conquista',
  },
};

const IMAGE_STYLES = {
  cinematic: {
    id: 'cinematic',
    label: 'Cinematografica',
    promptStyle:
      'cinematic commercial photography, dramatic lighting, premium composition, detailed textures, premium advertising look',
  },
  cartoon: {
    id: 'cartoon',
    label: 'Cartoon',
    promptStyle:
      'editorial cartoon illustration, stylized shapes, clean outlines, playful composition, polished magazine cover quality',
  },
  anime_ghibli: {
    id: 'anime_ghibli',
    label: 'Anime/Ghibli',
    promptStyle:
      'anime illustration, studio ghibli inspired atmosphere, expressive lighting, dreamy depth, hand-crafted visual storytelling',
  },
  pixar3d: {
    id: 'pixar3d',
    label: 'Pixar 3D',
    promptStyle:
      '3D animated film still, pixar-inspired lighting, smooth materials, rich color depth, polished cinematic render',
  },
  ultra_realistic: {
    id: 'ultra_realistic',
    label: 'Ultra-realistica',
    promptStyle:
      'ultra realistic photography, high detail skin and material texture, sharp lighting, depth of field, luxury commercial campaign',
  },
  editorial_dark: {
    id: 'editorial_dark',
    label: '🌑 Dark',
    promptStyle: 'dark editorial typography',
  },
  editorial_light: {
    id: 'editorial_light',
    label: '☀️ Light',
    promptStyle: 'light editorial typography',
  },
  editorial_mix: {
    id: 'editorial_mix',
    label: '⚡ Mix',
    promptStyle: 'mixed dark and light editorial cards',
  },
  editorial_surprise: {
    id: 'editorial_surprise',
    label: '✨ Surpreenda-me',
    promptStyle: 'editorial auto-selected style',
  },
};

const CARD_COUNT_OPTIONS = [3, 5, 7];

// Editorial styles are text-only (no AI image generation) — used by thiagaoai

const JOB_STATUS = {
  draft: 'draft',
  generatingStoryboard: 'generating_storyboard',
  researching: 'researching',
  generatingImages: 'generating_images',
  needsRetry: 'needs_retry',
  rendered: 'rendered',
  awaitingApproval: 'awaiting_approval',
  posted: 'posted',
  failed: 'failed',
  cancelled: 'cancelled',
};

const normalizeInstagramHandle = (value) => {
  if (!value) {
    return '@thiagaoai';
  }

  return value.startsWith('@') ? value : `@${value}`;
};

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const hashtagify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join('');

const extractTopicCandidate = (text) => {
  if (!text) {
    return '';
  }

  const cleaned = text
    .replace(/^\/carousel\b/i, '')
    .replace(/\b(please|por favor)\b/gi, '')
    .replace(
      /\b(faz|faca|faça|cria|crie|quero|preciso|manda|monta|gera|me ajuda a criar)\b/gi,
      ''
    )
    .replace(/\b(um|uma|o|a|os|as)\b/gi, '')
    .replace(/\b(carrossel|carousel|card|cards|post|posts)\b/gi, '')
    .replace(/\b(sobre|para|com|de)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length >= 6 ? cleaned : text.trim();
};

module.exports = {
  BRANDS,
  CONTENT_TYPES,
  IMAGE_STYLES,
  CARD_COUNT_OPTIONS,
  JOB_STATUS,
  normalizeInstagramHandle,
  slugify,
  hashtagify,
  extractTopicCandidate,
};
