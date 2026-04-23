const fs = require('fs');
const path = require('path');

class HeyGenClient {
  constructor({ apiKey } = {}) {
    this.apiKey = apiKey || process.env.HEYGEN_API_KEY;
    this.base = 'https://api.heygen.com/v2';
  }

  async generateAvatarVideo({ avatarId, voiceId, script, dimension = { width: 1080, height: 1920 }, outputPath }) {
    if (!this.apiKey) throw new Error('HEYGEN_API_KEY not set');

    const create = await fetch(`${this.base}/video/generate`, {
      method: 'POST',
      headers: { 'X-Api-Key': this.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_inputs: [
          {
            character: { type: 'avatar', avatar_id: avatarId, avatar_style: 'normal' },
            voice: { type: 'text', input_text: script, voice_id: voiceId },
          },
        ],
        dimension,
      }),
    });

    if (!create.ok) {
      throw new Error(`HeyGen create failed: ${create.status} ${await create.text()}`);
    }

    const { data } = await create.json();
    const videoId = data.video_id;

    const url = await this.pollVideo(videoId);
    return this.downloadTo(url, outputPath);
  }

  async pollVideo(videoId, { intervalMs = 5000, timeoutMs = 900000 } = {}) {
    const started = Date.now();
    while (true) {
      if (Date.now() - started > timeoutMs) throw new Error(`HeyGen timeout ${videoId}`);
      await new Promise((r) => setTimeout(r, intervalMs));
      const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: { 'X-Api-Key': this.apiKey },
      });
      const { data } = await res.json();
      if (data.status === 'completed') return data.video_url;
      if (data.status === 'failed') throw new Error(`HeyGen failed: ${data.error || 'unknown'}`);
    }
  }

  async downloadTo(url, outputPath) {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    return { path: outputPath, url, bytes: buffer.length };
  }

  async listAvatars() {
    if (!this.apiKey) return [];
    const res = await fetch(`${this.base}/avatars`, { headers: { 'X-Api-Key': this.apiKey } });
    const { data } = await res.json();
    return data?.avatars || [];
  }
}

module.exports = { HeyGenClient };
