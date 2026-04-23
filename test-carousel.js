const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createStoryboard } = require('./carousel-story');
const { CarouselRenderer } = require('./carousel-renderer');
const { CarouselResearchService } = require('./carousel-research');

const createRequest = (cardCount) => ({
  company: 'dockplus-ai',
  contentType: 'service_showcase',
  imageStyle: 'cinematic',
  cardCount,
  topic: 'instagram carousel automation for local businesses',
  instagramHandle: '@thiagaoai',
});

const createPlaceholder = (targetPath, label) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#0B1020" />
          <stop offset="100%" stop-color="#00FFFF" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1350" fill="url(#bg)" />
      <text x="90" y="240" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="700">
        ${label}
      </text>
    </svg>
  `;

  fs.writeFileSync(targetPath, svg.trim(), 'utf8');
};

const main = async () => {
  [3, 5, 7].forEach((count) => {
    const result = createStoryboard(createRequest(count));
    assert.strictEqual(result.storyboard.length, count, `Storyboard count mismatch for ${count}`);
    result.storyboard.forEach((card) => {
      assert.ok(card.headline, 'Card headline is required');
      assert.ok(card.body, 'Card body is required');
      assert.ok(card.imagePrompt, 'Card image prompt is required');
      assert.ok(card.layoutType, 'Card layoutType is required');
    });
  });

  const thiagaoAiStoryboard = createStoryboard({
    ...createRequest(3),
    company: 'thiagaoai',
    topic: 'daily editorial for automation founders',
    newsHeadline: 'AI copilots are moving from demo to operating system',
    newsSummary:
      'Founders are adopting AI copilots for daily operations, not just experiments, because execution speed now matters more than novelty.',
    editorialAngle:
      'Translate the headline into practical lessons for entrepreneurs who care about ROI, leadership and purpose.',
    researchContext: 'Base editorial from thiagodocarmo.dev plus news of the day.',
  });

  assert.ok(
    thiagaoAiStoryboard.caption.includes('@thiagaoai'),
    'ThiagaoAI caption should mention the Instagram handle'
  );
  assert.ok(
    thiagaoAiStoryboard.storyboard[0].headline.includes('AI COPILOTS'),
    'ThiagaoAI storyboard should reflect the news headline'
  );

  const researchService = new CarouselResearchService({
    perplexityApiKey: 'pplx-test',
    tavilyApiKey: 'tvly-test',
    firecrawlApiKey: 'fc-test',
    fetchImpl: async (url) => {
      if (url === 'https://thiagodocarmo.dev') {
        return {
          ok: true,
          text: async () =>
            '<html><body><h1>Thiago do Carmo</h1><p>Empresario, tecnologia, inovacao e proposito.</p></body></html>',
        };
      }

      if (url === 'https://api.perplexity.ai/v1/sonar') {
        return { ok: false, json: async () => ({}) };
      }

      if (url === 'https://api.tavily.com/search') {
        return {
          ok: true,
          json: async () => ({
            answer: 'AI agents are becoming practical operating tools for founders.',
            results: [
              {
                title: 'AI agents are becoming operating systems for teams',
                url: 'https://news.example.com/ai-agents',
                content: 'Teams are using AI agents to coordinate execution.',
              },
            ],
          }),
        };
      }

      if (url === 'https://api.firecrawl.dev/v2/scrape') {
        return {
          ok: true,
          json: async () => ({
            data: {
              markdown: '# Article\nAI agents now coordinate work across teams.',
              metadata: { title: 'AI agents article' },
            },
          }),
        };
      }

      throw new Error(`Unexpected URL in test: ${url}`);
    },
  });

  const research = await researchService.buildContext({
    company: 'thiagaoai',
    topic: 'daily editorial',
  });

  assert.strictEqual(research.researchProvider, 'tavily', 'Tavily fallback should be used');
  assert.ok(research.newsHeadline, 'Research should return a headline');
  assert.ok(research.sourceUrls.length > 0, 'Research should return source URLs');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carousel-render-'));
  const jobDir = path.join(tmpDir, 'job');
  const imagesDir = path.join(jobDir, 'images');
  fs.mkdirSync(imagesDir, { recursive: true });

  const request = createRequest(3);
  const { storyboard } = createStoryboard(request);
  const images = storyboard.map((card) => {
    const imagePath = path.join(imagesDir, `card-${card.index}.svg`);
    createPlaceholder(imagePath, `Card ${card.index}`);
    return {
      index: card.index,
      provider: 'test',
      prompt: card.imagePrompt,
      sourceUrl: null,
      imagePath,
    };
  });

  const renderer = new CarouselRenderer();
  const cards = await renderer.render({ request, storyboard, images, jobDir });

  assert.strictEqual(cards.length, 3, 'Renderer should output three cards');
  cards.forEach((card) => {
    assert.ok(fs.existsSync(card.path), `Rendered card missing: ${card.path}`);
  });

  console.log('Carousel smoke test passed.');
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
