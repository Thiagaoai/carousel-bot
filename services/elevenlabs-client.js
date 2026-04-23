const fs = require('fs');
const path = require('path');

class ElevenLabsClient {
  constructor({ apiKey, voiceId, modelId } = {}) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY;
    this.voiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
    this.modelId = modelId || 'eleven_multilingual_v2';
    this.base = 'https://api.elevenlabs.io/v1';
  }

  async tts({ text, outputPath, voiceId, stability = 0.5, similarityBoost = 0.75 }) {
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY not set');
    }

    const response = await fetch(`${this.base}/text-to-speech/${voiceId || this.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: this.modelId,
        voice_settings: { stability, similarity_boost: similarityBoost },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.status} ${await response.text()}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);
    return { path: outputPath, bytes: buffer.length };
  }

  async ttsWithTimestamps({ text, voiceId }) {
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY not set');
    }

    const response = await fetch(
      `${this.base}/text-to-speech/${voiceId || this.voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: { 'xi-api-key': this.apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model_id: this.modelId }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs timestamps failed: ${response.status}`);
    }

    return response.json();
  }

  async listVoices() {
    if (!this.apiKey) return [];
    const response = await fetch(`${this.base}/voices`, {
      headers: { 'xi-api-key': this.apiKey },
    });
    const data = await response.json();
    return data.voices || [];
  }
}

module.exports = { ElevenLabsClient };
