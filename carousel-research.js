const { BRANDS } = require('./carousel-config');

class CarouselResearchService {
  constructor({
    fetchImpl,
    perplexityApiKey,
    tavilyApiKey,
    firecrawlApiKey,
    siteUrl,
  } = {}) {
    this.fetch = fetchImpl || fetch;
    this.perplexityApiKey = perplexityApiKey || process.env.PERPLEXITY_API_KEY || '';
    this.tavilyApiKey = tavilyApiKey || process.env.TAVILY_API_KEY || '';
    this.firecrawlApiKey = firecrawlApiKey || process.env.FIRECRAWL_API_KEY || '';
    this.siteUrl = siteUrl || process.env.THIAGODOCARMO_SITE_URL || 'https://thiagodocarmo.dev';
  }

  async buildContext(request) {
    const brand = BRANDS[request.company];
    if (!brand || brand.editorialMode !== 'daily_news') {
      return null;
    }

    const siteProfile = await this.getSiteProfile(brand);
    const news = await this.lookupDailyNews(request, siteProfile);
    const sourceDetails = await this.enrichSources(news.sourceUrls || []);

    return {
      researchContext: this.composeResearchContext(siteProfile, news, sourceDetails),
      sourceUrls: this.uniqueUrls([
        ...(news.sourceUrls || []),
        ...sourceDetails.map((entry) => entry.url),
      ]),
      newsHeadline: news.newsHeadline,
      newsSummary: news.newsSummary,
      editorialAngle: news.editorialAngle,
      researchProvider: news.researchProvider,
      siteProfile,
      sourceDetails,
      topicOverride: news.topicOverride || news.newsHeadline,
    };
  }

  async getSiteProfile(brand) {
    const fallback = {
      siteUrl: brand.siteUrl || this.siteUrl,
      title: brand.name,
      voice: brand.editorialProfile && brand.editorialProfile.voice,
      audience: brand.editorialProfile && brand.editorialProfile.audience,
      pillars: (brand.editorialProfile && brand.editorialProfile.pillars) || [],
      summary:
        'Empresario brasileiro em Cape Cod focado em tecnologia, inovacao, fe, proposito e automacao inteligente com resultado real.',
      excerpt:
        'Excelencia, fe, proposito, automacao inteligente, negocios reais nos EUA e sistemas que geram ROI.',
    };

    try {
      const response = await this.fetch(fallback.siteUrl);
      if (!response.ok) {
        return fallback;
      }

      const html = await response.text();
      const text = this.stripHtml(html);
      const excerpt = text.slice(0, 2200);
      return {
        ...fallback,
        excerpt,
        summary: this.extractSiteSummary(excerpt, fallback.summary),
      };
    } catch {
      return fallback;
    }
  }

  async lookupDailyNews(request, siteProfile) {
    // Tavily first — real-time web index, no hallucination risk
    const tavilyResult = await this.searchWithTavily(request, siteProfile);
    if (tavilyResult) {
      // Perplexity enriches with editorial angle and summary
      const perplexityResult = await this.enrichWithPerplexity(tavilyResult, siteProfile);
      if (perplexityResult) {
        return perplexityResult;
      }
      return tavilyResult;
    }

    // Fallback: Perplexity standalone
    const perplexityResult = await this.searchWithPerplexity(request, siteProfile);
    if (perplexityResult) {
      return perplexityResult;
    }

    const error = new Error('Daily news research failed for thiagaoai');
    error.code = 'RESEARCH_FAILED';
    throw error;
  }

  async searchWithTavily(request, siteProfile) {
    if (!this.tavilyApiKey) {
      return null;
    }

    const today = new Date().toISOString().slice(0, 10);
    const topicHint = request.topic && request.topic.length > 4 ? request.topic : '';
    const query = topicHint
      ? `artificial intelligence ${topicHint} news ${today}`
      : `artificial intelligence AI news today ${today} OpenAI Google Anthropic model release`;

    const response = await this.fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.tavilyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        topic: 'news',
        time_range: 'day',
        days: 2,
        search_depth: 'advanced',
        max_results: 7,
        include_answer: 'advanced',
        include_raw_content: 'markdown',
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    if (!results.length) {
      return null;
    }

    // Score and pick the most AI-relevant result
    const aiKeywords = /\b(ai|artificial intelligence|openai|google|anthropic|claude|gemini|chatgpt|grok|llm|model|deepmind|machine learning|neural|robot|automation)\b/i;
    const scored = results
      .map((r) => ({ ...r, score: (aiKeywords.test(r.title) ? 2 : 0) + (aiKeywords.test(r.content || '') ? 1 : 0) }))
      .sort((a, b) => b.score - a.score);

    const top = scored[0];
    const sourceUrls = this.uniqueUrls(scored.slice(0, 3).map((r) => r.url));
    const rawSummary = data.answer || top.content || top.raw_content || '';
    const newsSummary = rawSummary.replace(/\s+/g, ' ').trim().slice(0, 280);

    return {
      newsHeadline: top.title || 'AI news today',
      newsSummary,
      editorialAngle: this.buildDefaultAngle(siteProfile, top.title || ''),
      topicOverride: top.title || 'AI news',
      sourceUrls,
      researchProvider: 'tavily',
    };
  }

  async enrichWithPerplexity(tavilyResult, siteProfile) {
    if (!this.perplexityApiKey) {
      return null;
    }

    const today = new Date().toISOString().slice(0, 10);
    const prompt = [
      `Hoje e ${today}. A seguinte noticia de Inteligencia Artificial foi encontrada:`,
      `Titulo: ${tavilyResult.newsHeadline}`,
      `Resumo: ${tavilyResult.newsSummary}`,
      '',
      'Com base SOMENTE nesta noticia real (nao invente fatos), retorne um JSON com:',
      '{"newsHeadline": "titulo em portugues claro e direto",',
      ' "newsSummary": "resumo factual em 2 frases curtas em portugues",',
      ' "editorialAngle": "explicacao em 1 frase: por que essa noticia importa para pessoas comuns e empresas"}',
      'Nao adicione informacoes que nao estejam na noticia. Seja factual.',
    ].join('\n');

    const response = await this.fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'You are a factual AI news translator and summarizer. Return only valid JSON. Never invent facts.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = this.extractJsonObject(content);

    if (!parsed.newsHeadline || !parsed.newsSummary) {
      return null;
    }

    return {
      ...tavilyResult,
      newsHeadline: parsed.newsHeadline,
      newsSummary: parsed.newsSummary,
      editorialAngle: parsed.editorialAngle || tavilyResult.editorialAngle,
      topicOverride: parsed.newsHeadline,
      researchProvider: 'tavily+perplexity',
    };
  }

  async searchWithPerplexity(request, siteProfile) {
    if (!this.perplexityApiKey) {
      return null;
    }

    const today = new Date().toISOString().slice(0, 10);
    const topicHint = request.topic && request.topic.length > 4 ? ` sobre "${request.topic}"` : '';
    const prompt = [
      `Hoje e ${today}.`,
      `Qual e a noticia mais importante de Inteligencia Artificial${topicHint} publicada hoje ou ontem?`,
      'Priorize: novos modelos de IA, lancamentos, pesquisas, atualizacoes de ferramentas como ChatGPT, Claude, Gemini, Grok, Midjourney.',
      'Retorne JSON estrito:',
      '{"newsHeadline":"titulo claro em portugues","newsSummary":"resumo factual em 2 frases","editorialAngle":"por que isso importa para pessoas e empresas","topicOverride":"tema da noticia","sourceUrls":["https://..."]}',
      'IMPORTANTE: Use apenas fatos reais e verificaveis. Nao invente. sourceUrls deve conter 2-3 URLs reais da noticia.',
    ].join('\n');

    const response = await this.fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'You are a factual AI news researcher. Return only valid JSON. Use real, verifiable facts only.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = this.extractJsonObject(content);
    const citations = Array.isArray(data.citations) ? data.citations : [];
    const searchUrls = (data.search_results || []).map((r) => r.url).filter(Boolean);
    const sourceUrls = this.uniqueUrls([...(parsed.sourceUrls || []), ...citations, ...searchUrls]);

    if (!parsed.newsHeadline || !parsed.newsSummary) {
      return null;
    }

    return {
      newsHeadline: parsed.newsHeadline,
      newsSummary: parsed.newsSummary,
      editorialAngle: parsed.editorialAngle || this.buildDefaultAngle(siteProfile, parsed.newsHeadline),
      topicOverride: parsed.topicOverride || parsed.newsHeadline,
      sourceUrls,
      researchProvider: 'perplexity',
    };
  }

  async enrichSources(sourceUrls) {
    if (!this.firecrawlApiKey || sourceUrls.length === 0) {
      return [];
    }

    const details = [];

    for (const url of sourceUrls.slice(0, 2)) {
      try {
        const response = await this.fetch('https://api.firecrawl.dev/v2/scrape', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const payload = data.data || data;
        const markdown = payload.markdown || '';
        details.push({
          url,
          title: payload.metadata && payload.metadata.title ? payload.metadata.title : url,
          excerpt: markdown.slice(0, 600),
        });
      } catch {
        continue;
      }
    }

    return details;
  }

  composeResearchContext(siteProfile, news, sourceDetails) {
    const sourceLine = sourceDetails.length
      ? sourceDetails.map((entry) => entry.title).join(' | ')
      : news.sourceUrls.join(' | ');

    return [
      `Base editorial: ${siteProfile.summary}`,
      `Noticia do dia: ${news.newsHeadline}`,
      `Resumo: ${news.newsSummary}`,
      `Angulo: ${news.editorialAngle}`,
      `Fontes: ${sourceLine}`,
    ].join('\n');
  }

  buildDefaultAngle(siteProfile, headline) {
    return `Explique o que "${headline}" significa na pratica: como isso muda o que as pessoas e empresas podem fazer com IA hoje.`;
  }

  extractSiteSummary(text, fallback) {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) {
      return fallback;
    }

    return clean.slice(0, 380);
  }

  stripHtml(html) {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractJsonObject(content) {
    if (!content) {
      return {};
    }

    const fenced = content.match(/```json\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1] : content;
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      return {};
    }

    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return {};
    }
  }

  uniqueUrls(urls) {
    return Array.from(new Set(urls.filter(Boolean)));
  }
}

module.exports = {
  CarouselResearchService,
};
