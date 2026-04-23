const fs = require('fs');
const path = require('path');

class HiggsfieldClient {
  constructor({ apiId, apiKey, base } = {}) {
    this.apiId = apiId || process.env.HIGGSFIELD_API_ID;
    this.apiKey = apiKey || process.env.HIGGSFIELD_API_KEY;
    this.base = base || process.env.HIGGSFIELD_API_BASE || 'https://platform.higgsfield.ai';
  }

  authHeader() {
    if (!this.apiId || !this.apiKey) {
      throw new Error('HIGGSFIELD_API_ID and HIGGSFIELD_API_KEY must both be set');
    }
    return `Key ${this.apiId}:${this.apiKey}`;
  }

  async submit({ modelPath, input }) {
    const res = await fetch(`${this.base}/${modelPath.replace(/^\//, '')}`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Higgsfield submit ${modelPath} failed: ${res.status} ${body.slice(0, 300)}`);
    }

    return res.json();
  }

  async getRequest(requestId) {
    const res = await fetch(`${this.base}/requests/${requestId}`, {
      headers: { Authorization: this.authHeader() },
    });
    if (!res.ok) {
      throw new Error(`Higgsfield status fetch failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
  }

  async poll(requestId, { intervalMs = 4000, timeoutMs = 600000 } = {}) {
    const started = Date.now();
    while (true) {
      if (Date.now() - started > timeoutMs) throw new Error(`Higgsfield timeout ${requestId}`);
      await new Promise((r) => setTimeout(r, intervalMs));
      const data = await this.getRequest(requestId);
      const status = (data.status || data.state || '').toLowerCase();
      if (['completed', 'succeeded', 'success', 'done'].includes(status)) {
        const url =
          data.output_url ||
          data.video_url ||
          data.result_url ||
          (Array.isArray(data.outputs) && data.outputs[0]?.url) ||
          data.result?.url;
        if (!url) throw new Error(`Higgsfield completed but no output URL: ${JSON.stringify(data).slice(0, 300)}`);
        return url;
      }
      if (['failed', 'error', 'cancelled'].includes(status)) {
        throw new Error(`Higgsfield ${status}: ${data.error || data.message || 'unknown'}`);
      }
    }
  }

  async generateVideo({
    prompt,
    referenceImage,
    outputPath,
    model = 'higgsfield-ai/soul/standard',
    aspectRatio = '9:16',
    resolution = '720p',
    duration,
  }) {
    const input = {
      prompt,
      aspect_ratio: aspectRatio,
      resolution,
    };
    if (referenceImage) input.reference_image_url = referenceImage;
    if (duration) input.duration_seconds = duration;

    const submit = await this.submit({ modelPath: model, input });
    const requestId = submit.request_id || submit.id;
    if (!requestId) throw new Error(`Higgsfield submit returned no request_id: ${JSON.stringify(submit).slice(0, 200)}`);

    const url = await this.poll(requestId);
    return this.downloadTo(url, outputPath);
  }

  async downloadTo(url, outputPath) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Higgsfield download failed: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    return { path: outputPath, url, bytes: buffer.length };
  }
}

module.exports = { HiggsfieldClient };
