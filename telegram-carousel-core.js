const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BRANDS = {
  roberts: {
    slug: 'roberts',
    name: 'Roberts Landscape Construction & Design',
    colors: { primary: '#2D5016', secondary: '#8B7355', accent: '#F5A623' },
    font: 'Poppins',
    tone: 'Trustworthy, local authority, craftsmanship pride',
  },
  cheesebread: {
    slug: 'cheesebread',
    name: 'Cheesebread Bakery Cafe',
    colors: { primary: '#D4A574', secondary: '#8B6F47', accent: '#FFE5CC' },
    font: 'Playfair Display',
    tone: 'Warm, artisan, inviting, community-centered',
  },
  'cape-codder': {
    slug: 'cape-codder',
    name: 'Cape Codder Home Improvement',
    colors: { primary: '#0055A8', secondary: '#F8A100', accent: '#E8E8E8' },
    font: 'Montserrat',
    tone: 'Reliable, professional, solution-oriented',
  },
  'all-granite': {
    slug: 'all-granite',
    name: 'All Granite & Stone',
    colors: { primary: '#4A4A4A', secondary: '#8B8B8B', accent: '#D4AF37' },
    font: 'Raleway',
    tone: 'Premium, sophisticated, design-forward',
  },
  'dockplus-ai': {
    slug: 'dockplus-ai',
    name: 'DockPlus AI Solutions',
    colors: { primary: '#1E1E2E', secondary: '#00FF00', accent: '#00FFFF' },
    font: 'JetBrains Mono',
    tone: 'Bold, results-first, technical credibility',
  },
};

const FLOW_TYPES = {
  testimonial: 'testimonial',
  tips: 'tips',
  promo: 'promo',
};

const normalizeInstagramHandle = (value) => {
  if (!value) {
    return '@thiagaoai';
  }

  return value.startsWith('@') ? value : `@${value}`;
};

const createPlaceholder = (width, height, background, color, text) => {
  const bg = background.replace('#', '');
  const fg = color.replace('#', '');
  return `https://placehold.co/${width}x${height}/${bg}/${fg}?text=${encodeURIComponent(text)}`;
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const sanitizeFileSegment = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'item';

const getBrand = (slug) => {
  const brand = BRANDS[slug];
  if (!brand) {
    throw new Error(`Unknown company slug: ${slug}`);
  }
  return brand;
};

const createRenderJob = (flow) => {
  const brand = getBrand(flow.company);

  if (flow.type === FLOW_TYPES.testimonial) {
    const filename = `${sanitizeFileSegment(flow.company)}-testimonial-${Date.now()}.mp4`;
    const instagramHandle = normalizeInstagramHandle(flow.instagramHandle);
    return {
      composition: 'TestimonialQuote',
      outputFile: filename,
      instagramHandle,
      props: {
        brand,
        quote: flow.quote,
        customerName: flow.customerName,
        customerTitle: flow.customerTitle || undefined,
        rating: 5,
        ctaText: flow.ctaText || 'Request your free estimate today',
      },
      caption: `${brand.name}\nInstagram: ${instagramHandle}\nTestimonial render ready.`,
    };
  }

  if (flow.type === FLOW_TYPES.tips) {
    const filename = `${sanitizeFileSegment(flow.company)}-tips-${Date.now()}.mp4`;
    const instagramHandle = normalizeInstagramHandle(flow.instagramHandle);
    return {
      composition: 'EducationalTips',
      outputFile: filename,
      instagramHandle,
      props: {
        brand,
        mainTitle: flow.mainTitle,
        tips: flow.tips,
        ctaText: flow.ctaText || 'Need help with this?',
        ctaAction: flow.ctaAction || 'Send us a message',
      },
      caption: `${brand.name}\nInstagram: ${instagramHandle}\nEducational carousel render ready.`,
    };
  }

  if (flow.type === FLOW_TYPES.promo) {
    const filename = `${sanitizeFileSegment(flow.company)}-promo-${Date.now()}.mp4`;
    const instagramHandle = normalizeInstagramHandle(flow.instagramHandle);
    return {
      composition: 'PromoOffer',
      outputFile: filename,
      instagramHandle,
      props: {
        brand,
        attentionText: flow.attentionText || 'LIMITED TIME',
        offerTitle: flow.offerTitle,
        offerDetail: flow.offerDetail,
        offerValue: flow.offerValue || undefined,
        ctaText: flow.ctaText || 'Call now',
        contactInfo: flow.contactInfo,
        backgroundImage:
          flow.backgroundImage ||
          createPlaceholder(1080, 1920, brand.colors.primary, '#ffffff', brand.name),
      },
      caption: `${brand.name}\nInstagram: ${instagramHandle}\nPromo render ready.`,
    };
  }

  throw new Error(`Unsupported flow type: ${flow.type}`);
};

const renderCarousel = async (flow) => {
  const job = createRenderJob(flow);
  const outDir = path.join(process.cwd(), 'out', 'telegram');
  const tempDir = path.join(process.cwd(), '.tmp', 'telegram');
  const propsPath = path.join(tempDir, `${path.parse(job.outputFile).name}.json`);
  const outputPath = path.join(outDir, job.outputFile);
  ensureDir(outDir);
  ensureDir(tempDir);

  fs.writeFileSync(propsPath, JSON.stringify(job.props, null, 2), 'utf8');

  await new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? (process.env.ComSpec || 'cmd.exe') : 'npx';
    const args = isWindows
      ? [
          '/d',
          '/s',
          '/c',
          'npx.cmd',
          'remotion',
          'render',
          'remotion-templates/index.ts',
          job.composition,
          outputPath,
          `--props=${propsPath}`,
        ]
      : [
          'remotion',
          'render',
          'remotion-templates/index.ts',
          job.composition,
          outputPath,
          `--props=${propsPath}`,
        ];

    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';

    child.stdout.on('data', () => {});
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `Remotion exited with code ${code}`));
    });
  });

  return {
    ...job,
    outputPath,
    propsPath,
  };
};

module.exports = {
  BRANDS,
  FLOW_TYPES,
  normalizeInstagramHandle,
  renderCarousel,
};
