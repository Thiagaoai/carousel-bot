const fs = require('fs');
const path = require('path');

class ReplicateClient {
  constructor({ apiToken } = {}) {
    this.apiToken = apiToken || process.env.REPLICATE_API_TOKEN;
    this.base = 'https://api.replicate.com/v1';
  }

  async runModel({ model, input, pollIntervalMs = 2000, timeoutMs = 300000 }) {
    if (!this.apiToken) throw new Error('REPLICATE_API_TOKEN not set');

    const create = await fetch(`${this.base}/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.apiToken}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({ input }),
    });

    if (!create.ok) {
      throw new Error(`Replicate create failed: ${create.status} ${await create.text()}`);
    }

    let prediction = await create.json();
    const started = Date.now();

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      if (Date.now() - started > timeoutMs) {
        throw new Error(`Replicate prediction timeout (${model})`);
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
      const poll = await fetch(`${this.base}/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${this.apiToken}` },
      });
      prediction = await poll.json();
    }

    if (prediction.status === 'failed') {
      throw new Error(`Replicate failed: ${prediction.error}`);
    }

    return prediction;
  }

  async generateImage({ prompt, outputPath, model = 'black-forest-labs/flux-schnell', extra = {} }) {
    const prediction = await this.runModel({
      model,
      input: { prompt, ...extra },
    });
    const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!url) throw new Error('Replicate returned no output URL');
    return this.downloadTo(url, outputPath);
  }

  async generateVideo({ prompt, outputPath, model = 'anotherjesse/zeroscope-v2-xl', extra = {} }) {
    const prediction = await this.runModel({
      model,
      input: { prompt, ...extra },
    });
    const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!url) throw new Error('Replicate returned no output URL');
    return this.downloadTo(url, outputPath);
  }

  async downloadTo(url, outputPath) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    return { path: outputPath, url, bytes: buffer.length };
  }
}

module.exports = { ReplicateClient };
