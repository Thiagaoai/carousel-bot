const fs = require('fs');
const path = require('path');

class RunwayClient {
  constructor({ apiKey } = {}) {
    this.apiKey = apiKey || process.env.RUNWAY_API_KEY || process.env.RUNWAYML_API_SECRET;
    this.base = 'https://api.dev.runwayml.com/v1';
  }

  async imageToVideo({ promptImage, promptText, duration = 5, ratio = '1280:720', outputPath }) {
    if (!this.apiKey) throw new Error('RUNWAY_API_KEY not set');

    const create = await fetch(`${this.base}/image_to_video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        promptImage,
        promptText,
        model: 'gen4_turbo',
        duration,
        ratio,
      }),
    });

    if (!create.ok) {
      throw new Error(`Runway create failed: ${create.status} ${await create.text()}`);
    }

    const { id } = await create.json();
    const task = await this.pollTask(id);

    if (task.status !== 'SUCCEEDED') {
      throw new Error(`Runway task ${task.status}: ${task.failureReason || 'unknown'}`);
    }

    const url = task.output && task.output[0];
    if (!url) throw new Error('Runway returned no output URL');

    return this.downloadTo(url, outputPath);
  }

  async pollTask(taskId, { intervalMs = 3000, timeoutMs = 600000 } = {}) {
    const started = Date.now();
    let task;
    do {
      if (Date.now() - started > timeoutMs) throw new Error(`Runway task timeout: ${taskId}`);
      await new Promise((r) => setTimeout(r, intervalMs));
      const res = await fetch(`${this.base}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}`, 'X-Runway-Version': '2024-11-06' },
      });
      task = await res.json();
    } while (task.status === 'PENDING' || task.status === 'RUNNING' || task.status === 'THROTTLED');
    return task;
  }

  async downloadTo(url, outputPath) {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    return { path: outputPath, url, bytes: buffer.length };
  }
}

module.exports = { RunwayClient };
