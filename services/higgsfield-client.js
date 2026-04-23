const fs = require('fs');
const path = require('path');

class HiggsfieldClient {
  constructor({ apiId, apiKey } = {}) {
    this.apiId = apiId || process.env.HIGGSFIELD_API_ID;
    this.apiKey = apiKey || process.env.HIGGSFIELD_API_KEY;
    this.base = process.env.HIGGSFIELD_API_BASE || 'https://platform.higgsfield.ai/v1';
  }

  authHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiId && this.apiKey) {
      headers['hf-api-id'] = this.apiId;
      headers['hf-api-key'] = this.apiKey;
      headers.Authorization = `Bearer ${this.apiKey}`;
    } else if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async generateVideo({ prompt, referenceImage, duration = 5, aspectRatio = '9:16', outputPath, motion = 'standard' }) {
    if (!this.apiKey) throw new Error('HIGGSFIELD_API_KEY not set');

    const create = await fetch(`${this.base}/videos/generate`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({
        prompt,
        reference_image_url: referenceImage || undefined,
        duration_seconds: duration,
        aspect_ratio: aspectRatio,
        motion_strength: motion,
      }),
    });

    if (!create.ok) {
      throw new Error(`Higgsfield create failed: ${create.status} ${await create.text()}`);
    }

    const { job_id: jobId } = await create.json();
    const url = await this.pollJob(jobId);
    return this.downloadTo(url, outputPath);
  }

  async pollJob(jobId, { intervalMs = 4000, timeoutMs = 600000 } = {}) {
    const started = Date.now();
    while (true) {
      if (Date.now() - started > timeoutMs) throw new Error(`Higgsfield timeout ${jobId}`);
      await new Promise((r) => setTimeout(r, intervalMs));
      const res = await fetch(`${this.base}/jobs/${jobId}`, {
        headers: this.authHeaders(),
      });
      const data = await res.json();
      if (data.status === 'completed' || data.status === 'succeeded') return data.result_url || data.video_url;
      if (data.status === 'failed') throw new Error(`Higgsfield failed: ${data.error || 'unknown'}`);
    }
  }

  async downloadTo(url, outputPath) {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    return { path: outputPath, url, bytes: buffer.length };
  }
}

module.exports = { HiggsfieldClient };
