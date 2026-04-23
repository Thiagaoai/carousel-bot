const { ReplicateClient } = require('./replicate-client');
const { RunwayClient } = require('./runway-client');
const { HeyGenClient } = require('./heygen-client');
const { HiggsfieldClient } = require('./higgsfield-client');
const { ElevenLabsClient } = require('./elevenlabs-client');

const TIER_COSTS = {
  heygen: 0.5,
  falai_kling: 0.4,
  runway_gen4: 0.5,
  higgsfield: 0.3,
  replicate_video: 0.02,
  remotion: 0,
  elevenlabs: 0.003,
  falai_flux: 0.05,
  replicate_image: 0.01,
};

class MediaRouter {
  constructor() {
    this.replicate = new ReplicateClient();
    this.runway = new RunwayClient();
    this.heygen = new HeyGenClient();
    this.higgsfield = new HiggsfieldClient();
    this.elevenlabs = new ElevenLabsClient();
  }

  async generateVideo({ prompt, outputPath, duration = 5, aspectRatio = '9:16', tier = 'auto', referenceImage }) {
    const chain = tier === 'auto'
      ? ['higgsfield', 'runway', 'replicate']
      : [tier];

    let lastError;
    for (const provider of chain) {
      try {
        if (provider === 'runway') {
          return await this.runway.imageToVideo({
            promptImage: referenceImage,
            promptText: prompt,
            duration,
            ratio: aspectRatio === '9:16' ? '720:1280' : '1280:720',
            outputPath,
          });
        }
        if (provider === 'higgsfield') {
          return await this.higgsfield.generateVideo({
            prompt,
            referenceImage,
            duration,
            aspectRatio,
            outputPath,
          });
        }
        if (provider === 'replicate') {
          return await this.replicate.generateVideo({ prompt, outputPath });
        }
      } catch (err) {
        lastError = err;
        console.warn(`[media-router] ${provider} failed: ${err.message} — trying next`);
      }
    }
    throw lastError || new Error('All video tiers failed');
  }

  async generateAvatarVideo({ avatarId, voiceId, script, outputPath }) {
    return this.heygen.generateAvatarVideo({ avatarId, voiceId, script, outputPath });
  }

  async generateVoiceover({ text, outputPath, voiceId }) {
    return this.elevenlabs.tts({ text, outputPath, voiceId });
  }

  estimateCost({ tier, durationSeconds = 5, characters = 0 }) {
    const video = (TIER_COSTS[tier] || 0) * (durationSeconds / 5);
    const voice = TIER_COSTS.elevenlabs * characters;
    return { video, voice, total: video + voice };
  }
}

module.exports = { MediaRouter, TIER_COSTS };
