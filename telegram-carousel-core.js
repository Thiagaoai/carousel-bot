const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const {
  BRANDS,
  CONTENT_TYPES,
  IMAGE_STYLES,
  CARD_COUNT_OPTIONS,
  JOB_STATUS,
  normalizeInstagramHandle,
  slugify,
} = require('./carousel-config');
const { createStoryboard } = require('./carousel-story');
const { CarouselImageService } = require('./carousel-image');
const { CarouselResearchService } = require('./carousel-research');
const { CarouselRenderer } = require('./carousel-renderer');
const { PostformeClient } = require('./postforme-client');
const { CarouselStorage } = require('./carousel-storage');

class CarouselEngine {
  constructor({
    imageService,
    researchService,
    renderer,
    postformeClient,
    storage,
    outputRoot,
    allowPlaceholders,
  } = {}) {
    this.jobs = new Map();
    this.imageService = imageService || new CarouselImageService();
    this.researchService = researchService || new CarouselResearchService();
    this.renderer = renderer || new CarouselRenderer();
    this.postformeClient = postformeClient || new PostformeClient();
    this.storage = storage || new CarouselStorage();
    this.outputRoot = outputRoot || path.join(process.cwd(), 'out', 'carousels');
    this.allowPlaceholders = Boolean(
      allowPlaceholders || process.env.CAROUSEL_ALLOW_PLACEHOLDERS === 'true'
    );
  }

  async createDraft(request) {
    this.validateRequest(request);

    const id = request.id || randomUUID();
    const safeTopic = slugify(request.topic || request.initialRequest || 'carousel');
    const outputDir = path.join(
      this.outputRoot,
      `${slugify(request.company)}-${safeTopic || 'job'}-${Date.now()}-${id.slice(0, 8)}`
    );

    fs.mkdirSync(outputDir, { recursive: true });

    const job = {
      id,
      company: request.company,
      contentType: request.contentType,
      imageStyle: request.imageStyle,
      cardCount: Number(request.cardCount),
      topic: request.topic || '',
      initialRequest: request.initialRequest || '',
      instagramHandle: normalizeInstagramHandle(request.instagramHandle),
      language: request.language || 'both',
      researchContext: request.researchContext || '',
      sourceUrls: request.sourceUrls || [],
      newsHeadline: request.newsHeadline || '',
      newsSummary: request.newsSummary || '',
      editorialAngle: request.editorialAngle || '',
      researchProvider: request.researchProvider || '',
      siteProfile: request.siteProfile || null,
      status: JOB_STATUS.draft,
      storyboard: [],
      images: [],
      cards: [],
      caption: '',
      outputDir,
      previewMessageId: null,
      postformeId: null,
      instagramUrl: null,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveJob(job);
  }

  async getJob(jobId) {
    if (this.jobs.has(jobId)) {
      return this.jobs.get(jobId);
    }

    const stored = await this.storage.getJob(jobId);
    if (!stored) {
      return null;
    }

    const hydrated = this.hydrateJob(stored);
    this.jobs.set(hydrated.id, hydrated);
    return hydrated;
  }

  async generate(job, { mode = 'full', allowPlaceholders = this.allowPlaceholders } = {}) {
    const currentJob = await this.resolveJob(job);
    if (!currentJob) {
      throw new Error('Carousel job not found');
    }

    try {
      if (mode === 'full' || mode === 'story') {
        if (BRANDS[currentJob.company] && BRANDS[currentJob.company].editorialMode === 'daily_news') {
          currentJob.status = JOB_STATUS.researching;
          currentJob.error = null;
          await this.saveJob(currentJob);

          const research = await this.researchService.buildContext(currentJob);
          currentJob.researchContext = research.researchContext;
          currentJob.sourceUrls = research.sourceUrls;
          currentJob.newsHeadline = research.newsHeadline;
          currentJob.newsSummary = research.newsSummary;
          currentJob.editorialAngle = research.editorialAngle;
          currentJob.researchProvider = research.researchProvider;
          currentJob.siteProfile = research.siteProfile;
          currentJob.topic = research.topicOverride || currentJob.topic;
        } else {
          const brand = BRANDS[currentJob.company];
          if (brand && brand.siteUrl && !currentJob.siteProfile) {
            try {
              currentJob.siteProfile = await this.researchService.getSiteProfile(brand);
            } catch {}
          }
        }

        currentJob.status = JOB_STATUS.generatingStoryboard;
        currentJob.error = null;
        await this.saveJob(currentJob);

        const story = createStoryboard(currentJob);
        currentJob.storyboard = story.storyboard;
        currentJob.caption = story.caption;
      }

      if (!currentJob.storyboard.length) {
        throw new Error('Storyboard is empty');
      }

      currentJob.status = JOB_STATUS.generatingImages;
      currentJob.error = null;
      await this.saveJob(currentJob);

      const isEditorialStyle = currentJob.imageStyle && currentJob.imageStyle.startsWith('editorial_');
      currentJob.images = isEditorialStyle
        ? currentJob.storyboard.map((card) => ({
            index: card.index,
            provider: 'editorial',
            prompt: '',
            sourceUrl: null,
            imagePath: null,
          }))
        : await this.imageService.generateImages({
            storyboard: currentJob.storyboard,
            jobDir: currentJob.outputDir,
            allowPlaceholders,
          });

      currentJob.storyboard = currentJob.storyboard.map((card) => {
        const image = currentJob.images.find((entry) => entry.index === card.index);
        return {
          ...card,
          imagePath: image ? image.imagePath : null,
        };
      });

      currentJob.cards = await this.renderer.render({
        request: currentJob,
        storyboard: currentJob.storyboard,
        images: currentJob.images,
        jobDir: currentJob.outputDir,
      });

      currentJob.status = JOB_STATUS.awaitingApproval;
      currentJob.updatedAt = new Date().toISOString();
      return this.saveJob(currentJob);
    } catch (error) {
      currentJob.error = error.message;
      currentJob.status =
        error.code === 'IMAGE_GENERATION_FAILED' ? JOB_STATUS.needsRetry : JOB_STATUS.failed;
      currentJob.updatedAt = new Date().toISOString();
      await this.saveJob(currentJob);
      throw error;
    }
  }

  async regenerateImages(job, options = {}) {
    return this.generate(job, { mode: 'images', ...options });
  }

  async regenerateStory(job, options = {}) {
    const currentJob = await this.resolveJob(job);
    currentJob.storyboard = [];
    currentJob.images = [];
    currentJob.cards = [];
    currentJob.caption = '';
    currentJob.error = null;
    await this.saveJob(currentJob);
    return this.generate(currentJob, { mode: 'story', ...options });
  }

  async markPreviewMessage(job, previewMessageId) {
    const currentJob = await this.resolveJob(job);
    currentJob.previewMessageId = previewMessageId;
    currentJob.updatedAt = new Date().toISOString();
    return this.saveJob(currentJob);
  }

  async approveAndPost(job) {
    const currentJob = await this.resolveJob(job);
    if (!currentJob.cards.length) {
      throw new Error('No rendered cards available for publication');
    }

    const result = await this.postformeClient.publishCarousel(
      currentJob.cards.map((card) => card.path),
      currentJob.caption
    );

    currentJob.status = JOB_STATUS.posted;
    currentJob.postformeId = result.postformeId;
    currentJob.instagramUrl = result.instagramUrl;
    currentJob.error = null;
    currentJob.updatedAt = new Date().toISOString();

    await this.saveJob(currentJob);

    return {
      ...result,
      job: currentJob,
    };
  }

  async cancel(job, reason = 'Cancelled by user') {
    const currentJob = await this.resolveJob(job);
    if (!currentJob) {
      return null;
    }

    currentJob.status = JOB_STATUS.cancelled;
    currentJob.error = reason;
    currentJob.updatedAt = new Date().toISOString();
    return this.saveJob(currentJob);
  }

  summarize(job) {
    const currentJob = typeof job === 'string' ? this.jobs.get(job) : job;
    if (!currentJob) {
      return 'Job not found.';
    }

    const brand = BRANDS[currentJob.company];
    const contentType = CONTENT_TYPES[currentJob.contentType];
    const imageStyle = IMAGE_STYLES[currentJob.imageStyle];

    return [
      `Empresa: ${brand.name}`,
      `Tipo: ${contentType.label}`,
      `Estilo visual: ${imageStyle.label}`,
      `Quantidade: ${currentJob.cardCount} cards`,
      `Tema: ${currentJob.topic}`,
      currentJob.newsHeadline ? `Noticia: ${currentJob.newsHeadline}` : null,
      currentJob.researchProvider ? `Pesquisa: ${currentJob.researchProvider}` : null,
      `Instagram: ${currentJob.instagramHandle}`,
      `Status: ${currentJob.status}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  validateRequest(request) {
    if (!BRANDS[request.company]) {
      throw new Error(`Unknown company slug: ${request.company}`);
    }

    if (!CONTENT_TYPES[request.contentType]) {
      throw new Error(`Unsupported content type: ${request.contentType}`);
    }

    if (!IMAGE_STYLES[request.imageStyle]) {
      throw new Error(`Unsupported image style: ${request.imageStyle}`);
    }

    const cardCount = Number(request.cardCount);
    if (!CARD_COUNT_OPTIONS.includes(cardCount)) {
      throw new Error(`Unsupported card count: ${request.cardCount}`);
    }
  }

  hydrateJob(stored) {
    return {
      id: stored.id,
      company: stored.company || stored.empresa,
      instagramHandle: normalizeInstagramHandle(
        stored.instagramHandle || stored.instagram_handle || '@thiagaoai'
      ),
      language: stored.language || 'both',
      researchContext: stored.researchContext || stored.research_context || '',
      sourceUrls: stored.sourceUrls || stored.source_urls || [],
      newsHeadline: stored.newsHeadline || stored.news_headline || '',
      newsSummary: stored.newsSummary || stored.news_summary || '',
      editorialAngle: stored.editorialAngle || stored.editorial_angle || '',
      researchProvider: stored.researchProvider || stored.research_provider || '',
      siteProfile: stored.siteProfile || stored.site_profile || null,
      contentType: stored.contentType || stored.content_type,
      imageStyle: stored.imageStyle || stored.image_style,
      cardCount: Number(stored.cardCount || stored.card_count || 3),
      topic: stored.topic || '',
      initialRequest: stored.initialRequest || stored.initial_request || '',
      status: stored.status || JOB_STATUS.draft,
      storyboard: stored.storyboard || [],
      images: stored.images || [],
      cards: stored.cards || [],
      caption: stored.caption || '',
      outputDir: stored.outputDir || stored.output_dir || '',
      previewMessageId: stored.previewMessageId || stored.preview_message_id || null,
      postformeId: stored.postformeId || stored.postforme_id || null,
      instagramUrl: stored.instagramUrl || stored.instagram_url || null,
      error: stored.error || stored.error_msg || null,
      createdAt: stored.createdAt || stored.created_at || new Date().toISOString(),
      updatedAt: stored.updatedAt || stored.updated_at || new Date().toISOString(),
    };
  }

  async resolveJob(job) {
    if (!job) {
      return null;
    }

    if (typeof job === 'string') {
      return this.getJob(job);
    }

    if (job.id && this.jobs.has(job.id)) {
      return this.jobs.get(job.id);
    }

    if (job.id) {
      return this.saveJob(job);
    }

    return job;
  }

  async saveJob(job) {
    const normalized = {
      ...job,
      instagramHandle: normalizeInstagramHandle(job.instagramHandle),
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(normalized.id, normalized);
    await this.storage.upsertJob(normalized);
    return normalized;
  }
}

module.exports = {
  BRANDS,
  CONTENT_TYPES,
  IMAGE_STYLES,
  CARD_COUNT_OPTIONS,
  JOB_STATUS,
  normalizeInstagramHandle,
  CarouselEngine,
};
