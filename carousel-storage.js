const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { JOB_STATUS } = require('./carousel-config');

const LOCAL_STORE = path.join(process.cwd(), '.tmp', 'jobs.json');

function readLocalStore() {
  try {
    if (fs.existsSync(LOCAL_STORE)) {
      return JSON.parse(fs.readFileSync(LOCAL_STORE, 'utf8'));
    }
  } catch {}
  return {};
}

function writeLocalStore(store) {
  try {
    fs.mkdirSync(path.dirname(LOCAL_STORE), { recursive: true });
    fs.writeFileSync(LOCAL_STORE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.warn(`Local store write failed: ${e.message}`);
  }
}

class CarouselStorage {
  constructor() {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

    this.supabaseEnabled = false;
    this.client = null;

    if (url && key) {
      this.client = createClient(url, key, { db: { schema: 'agente_dev' } });
      this._testSupabase().then((ok) => {
        this.supabaseEnabled = ok;
        if (!ok) console.warn('Supabase unreachable — using local file storage (.tmp/jobs.json)');
      });
    } else {
      console.warn('Supabase not configured — using local file storage (.tmp/jobs.json)');
    }
  }

  async _testSupabase() {
    try {
      const { error } = await this.client.from('carousel_jobs').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  async upsertJob(job) {
    const payload = {
      id: job.id,
      empresa: job.company,
      instagram_handle: job.instagramHandle,
      research_context: job.researchContext || '',
      source_urls: job.sourceUrls || [],
      news_headline: job.newsHeadline || '',
      news_summary: job.newsSummary || '',
      editorial_angle: job.editorialAngle || '',
      research_provider: job.researchProvider || '',
      site_profile: job.siteProfile || null,
      content_type: job.contentType,
      image_style: job.imageStyle,
      card_count: job.cardCount,
      topic: job.topic || '',
      initial_request: job.initialRequest || '',
      status: job.status || JOB_STATUS.draft,
      storyboard: job.storyboard || [],
      images: job.images || [],
      cards: job.cards || [],
      caption: job.caption || '',
      output_dir: job.outputDir || '',
      preview_message_id: job.previewMessageId || null,
      postforme_id: job.postformeId || null,
      instagram_url: job.instagramUrl || null,
      error_msg: job.error || null,
      updated_at: new Date().toISOString(),
    };

    if (this.supabaseEnabled) {
      const { error } = await this.client.from('carousel_jobs').upsert(payload);
      if (error) {
        console.warn(`Supabase upsert failed: ${error.message} — saving locally`);
        this._saveLocal(job.id, payload);
      }
    } else {
      this._saveLocal(job.id, payload);
    }

    return payload;
  }

  async getJob(jobId) {
    if (this.supabaseEnabled) {
      try {
        const { data, error } = await this.client
          .from('carousel_jobs')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();
        if (!error && data) return data;
      } catch {}
    }

    return this._loadLocal(jobId);
  }

  _saveLocal(jobId, payload) {
    const store = readLocalStore();
    store[jobId] = payload;
    writeLocalStore(store);
  }

  _loadLocal(jobId) {
    const store = readLocalStore();
    return store[jobId] || null;
  }
}

module.exports = {
  CarouselStorage,
};
