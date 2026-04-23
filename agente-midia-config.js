// Agente Mídia — master config
// Platforms, service tiers, agent dispatch

const PLATFORMS = {
  'instagram-carousel': {
    name: 'Instagram Carousel',
    format: 'image',
    aspect: '4:5',
    dimensions: { width: 1080, height: 1350 },
    agent: 'carousel-agent',
    captionLimit: 2200,
    hashtagCount: [3, 10],
  },
  'instagram-reel': {
    name: 'Instagram Reel',
    format: 'video',
    aspect: '9:16',
    dimensions: { width: 1080, height: 1920 },
    durationSec: [15, 90],
    agent: 'reels-agent',
    captionLimit: 2200,
    hashtagCount: [3, 5],
  },
  'instagram-story': {
    name: 'Instagram Story',
    format: 'video',
    aspect: '9:16',
    dimensions: { width: 1080, height: 1920 },
    durationSec: [1, 15],
    agent: 'reels-agent',
    captionLimit: 0,
    hashtagCount: [0, 3],
  },
  'tiktok': {
    name: 'TikTok',
    format: 'video',
    aspect: '9:16',
    dimensions: { width: 1080, height: 1920 },
    durationSec: [15, 180],
    agent: 'tiktok-agent',
    captionLimit: 4000,
    hashtagCount: [3, 5],
  },
  'youtube-shorts': {
    name: 'YouTube Shorts',
    format: 'video',
    aspect: '9:16',
    dimensions: { width: 1080, height: 1920 },
    durationSec: [15, 60],
    agent: 'youtube-shorts-agent',
    captionLimit: 5000,
    hashtagCount: [3, 5],
  },
  'linkedin-post': {
    name: 'LinkedIn Post',
    format: 'text',
    agent: 'linkedin-agent',
    captionLimit: 3000,
    hashtagCount: [3, 5],
  },
  'linkedin-article': {
    name: 'LinkedIn Article',
    format: 'longform',
    agent: 'linkedin-agent',
    captionLimit: 125000,
    hashtagCount: [3, 5],
  },
  'linkedin-document': {
    name: 'LinkedIn Document Carousel',
    format: 'pdf',
    aspect: '4:5',
    dimensions: { width: 1080, height: 1350 },
    slideCount: [5, 12],
    agent: 'linkedin-agent',
    captionLimit: 3000,
    hashtagCount: [3, 5],
  },
  'twitter-single': {
    name: 'Twitter/X Single',
    format: 'text',
    agent: 'twitter-agent',
    captionLimit: 280,
    hashtagCount: [1, 2],
  },
  'twitter-thread': {
    name: 'Twitter/X Thread',
    format: 'text',
    agent: 'twitter-agent',
    tweetCount: [5, 12],
    captionLimit: 280,
    hashtagCount: [1, 2],
  },
  'facebook-post': {
    name: 'Facebook Post',
    format: 'image',
    dimensions: { width: 1080, height: 1080 },
    agent: 'facebook-agent',
    captionLimit: 63206,
    hashtagCount: [1, 3],
  },
  'facebook-reel': {
    name: 'Facebook Reel',
    format: 'video',
    aspect: '9:16',
    dimensions: { width: 1080, height: 1920 },
    durationSec: [15, 90],
    agent: 'facebook-agent',
    captionLimit: 63206,
    hashtagCount: [1, 3],
  },
  'ad-meta': {
    name: 'Meta Ad',
    format: 'image+video',
    agent: 'ads-agent',
    variants: ['1:1', '4:5', '9:16'],
    captionLimit: 125,
  },
  'ad-google': {
    name: 'Google Ad',
    format: 'text+image',
    agent: 'ads-agent',
    captionLimit: 90,
  },
  'ad-tiktok': {
    name: 'TikTok Ad',
    format: 'video',
    aspect: '9:16',
    agent: 'ads-agent',
    captionLimit: 2200,
  },
  'ad-linkedin': {
    name: 'LinkedIn Ad',
    format: 'image+video',
    agent: 'ads-agent',
    captionLimit: 600,
  },
};

const SERVICE_TIERS = {
  // ── IMAGES ──
  'falai-flux-ultra':   { cost: 0.05, type: 'image',  provider: 'fal.ai',    quality: 'premium' },
  'falai-flux-schnell': { cost: 0.003, type: 'image', provider: 'fal.ai',    quality: 'fast'    },
  'replicate-flux':     { cost: 0.01, type: 'image',  provider: 'replicate', quality: 'std'     },
  'replicate-sdxl':     { cost: 0.01, type: 'image',  provider: 'replicate', quality: 'std'     },

  // ── VIDEO ──
  'heygen-avatar':      { cost: 0.50, type: 'video',  provider: 'heygen',     quality: 'avatar'     },
  'falai-kling':        { cost: 0.40, type: 'video',  provider: 'fal.ai',     quality: 'cinematic'  },
  'runway-gen4':        { cost: 0.50, type: 'video',  provider: 'runway',     quality: 'premium'    },
  'higgsfield':         { cost: 0.30, type: 'video',  provider: 'higgsfield', quality: 'motion'     },
  'replicate-zeroscope':{ cost: 0.02, type: 'video',  provider: 'replicate',  quality: 'budget'     },
  'remotion':           { cost: 0.00, type: 'video',  provider: 'remotion',   quality: 'local'      },

  // ── AUDIO ──
  'elevenlabs-tts':     { cost: 0.003, type: 'audio', provider: 'elevenlabs', quality: 'premium', unit: 'char' },

  // ── DESIGN / TEMPLATES ──
  'canva-template':     { cost: 0.00, type: 'design', provider: 'canva',      quality: 'template' },
  'figma-design':       { cost: 0.00, type: 'design', provider: 'figma',      quality: 'custom'   },
  'claude-design':      { cost: 0.00, type: 'design', provider: 'claude',     quality: 'generated'},

  // ── TEXT ──
  'claude-sonnet':      { cost: 0.003, type: 'text',  provider: 'anthropic',  quality: 'premium', unit: '1k-tokens' },
  'deepseek':           { cost: 0.0001, type: 'text', provider: 'deepseek',   quality: 'bulk',    unit: '1k-tokens' },
  'perplexity':         { cost: 0.005, type: 'research', provider: 'perplexity', quality: 'realtime', unit: 'query' },
  'tavily':             { cost: 0.005, type: 'research', provider: 'tavily',     quality: 'fresh',    unit: 'query' },
};

const FALLBACK_CHAINS = {
  image: ['falai-flux-ultra', 'falai-flux-schnell', 'replicate-flux', 'replicate-sdxl'],
  video: ['higgsfield', 'falai-kling', 'runway-gen4', 'replicate-zeroscope', 'remotion'],
  'video-avatar': ['heygen-avatar', 'falai-kling', 'remotion'],
  audio: ['elevenlabs-tts'],
  text: ['claude-sonnet', 'deepseek'],
  research: ['perplexity', 'tavily'],
};

const AGENT_DISPATCH = {
  carousel: 'carousel-agent',
  reel: 'reels-agent',
  shorts: 'youtube-shorts-agent',
  tiktok: 'tiktok-agent',
  linkedin: 'linkedin-agent',
  twitter: 'twitter-agent',
  tweet: 'twitter-agent',
  thread: 'twitter-agent',
  facebook: 'facebook-agent',
  ad: 'ads-agent',
  'ads-set': 'ads-agent',
  design: 'design-agent',
  tags: 'hashtag-agent',
  copy: 'copywriter-agent',
  analytics: 'analytics-agent',
  'midia-full': 'orchestrator',
  repurpose: 'orchestrator',
};

const BUDGET = {
  hardCapMonthUSD: 200,
  alertThresholdPct: 80,
  softCapMonthUSD: 160,
};

module.exports = {
  PLATFORMS,
  SERVICE_TIERS,
  FALLBACK_CHAINS,
  AGENT_DISPATCH,
  BUDGET,
};
