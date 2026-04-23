const fs = require('fs');

class CarouselImageService {
  constructor({ falKey, replicateToken, openaiKey, fetchImpl } = {}) {
    this.falKey = falKey || process.env.FAL_KEY || '';
    this.replicateToken = replicateToken || process.env.REPLICATE_API_TOKEN || '';
    this.openaiKey = openaiKey || process.env.OPENAI_API_KEY || '';
    this.fetch = fetchImpl || fetch;
  }

  async generateImages({ storyboard, jobDir, allowPlaceholders = false }) {
    const imagesDir = `${jobDir}/images`;
    fs.mkdirSync(imagesDir, { recursive: true });

    const images = [];

    for (const card of storyboard) {
      const targetPath = `${imagesDir}/card-${card.index}.png`;
      const result = await this.generateSingleImage(card.imagePrompt, targetPath);

      if (!result) {
        if (allowPlaceholders) {
          await this.createPlaceholderImage(targetPath, card.index);
          images.push({
            index: card.index,
            provider: 'placeholder',
            prompt: card.imagePrompt,
            sourceUrl: null,
            imagePath: targetPath,
          });
          continue;
        }

        const error = new Error(`Image generation failed on card ${card.index}`);
        error.code = 'IMAGE_GENERATION_FAILED';
        error.cardIndex = card.index;
        throw error;
      }

      images.push({
        index: card.index,
        provider: result.provider,
        prompt: card.imagePrompt,
        sourceUrl: result.sourceUrl,
        imagePath: targetPath,
      });
    }

    return images;
  }

  async generateSingleImage(prompt, outputPath) {
    const openaiResult = await this.generateWithOpenAI(prompt, outputPath);
    if (openaiResult) {
      return openaiResult;
    }

    const falResult = await this.generateWithFal(prompt, outputPath);
    if (falResult) {
      return falResult;
    }

    const replicateResult = await this.generateWithReplicate(prompt, outputPath);
    if (replicateResult) {
      return replicateResult;
    }

    return null;
  }

  async generateWithOpenAI(prompt, outputPath) {
    if (!this.openaiKey) {
      return null;
    }

    const response = await this.fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size: '1024x1280',
        quality: 'medium',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[openai] image generation failed:', response.status, errText);
      return null;
    }

    const data = await response.json();
    const b64 = data.data && data.data[0] && data.data[0].b64_json;
    if (!b64) {
      return null;
    }

    fs.writeFileSync(outputPath, Buffer.from(b64, 'base64'));
    return { provider: 'openai', sourceUrl: null };
  }

  async generateWithFal(prompt, outputPath) {
    if (!this.falKey) {
      return null;
    }

    const submitResponse = await this.fetch('https://queue.fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        Authorization: `Key ${this.falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: { width: 1080, height: 1350 },
        num_images: 1,
        num_inference_steps: 4,
        enable_safety_checker: true,
      }),
    });

    if (!submitResponse.ok) {
      return null;
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.request_id || submitData.requestId;
    const statusUrl = submitData.status_url;
    const responseUrl = submitData.response_url;

    if (!requestId) {
      const immediateUrl = this.extractImageUrl(submitData);
      if (!immediateUrl) {
        return null;
      }

      await this.downloadToFile(immediateUrl, outputPath);
      return { provider: 'fal', sourceUrl: immediateUrl };
    }

    const resolvedStatusUrl = statusUrl || `https://queue.fal.run/fal-ai/flux/requests/${requestId}/status`;
    const resolvedResponseUrl = responseUrl || `https://queue.fal.run/fal-ai/flux/requests/${requestId}`;

    for (let attempt = 0; attempt < 30; attempt += 1) {
      await this.sleep(2000);

      const statusResponse = await this.fetch(resolvedStatusUrl, {
        headers: { Authorization: `Key ${this.falKey}` },
      });

      if (!statusResponse.ok) {
        continue;
      }

      const statusData = await statusResponse.json();
      const status = statusData.status || statusData.request_status;

      if (status === 'COMPLETED') {
        const resultResponse = await this.fetch(resolvedResponseUrl, {
          headers: { Authorization: `Key ${this.falKey}` },
        });

        if (!resultResponse.ok) {
          return null;
        }

        const resultData = await resultResponse.json();
        const imageUrl = this.extractImageUrl(resultData);
        if (!imageUrl) {
          return null;
        }

        await this.downloadToFile(imageUrl, outputPath);
        return { provider: 'fal', sourceUrl: imageUrl };
      }

      if (status === 'FAILED' || status === 'CANCELLED') {
        return null;
      }
    }

    return null;
  }

  async generateWithReplicate(prompt, outputPath) {
    if (!this.replicateToken) {
      return null;
    }

    const response = await this.fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.replicateToken}`,
          'Content-Type': 'application/json',
          Prefer: 'wait',
        },
        body: JSON.stringify({
          input: {
            prompt,
            aspect_ratio: '4:5',
            num_outputs: 1,
            output_format: 'png',
            num_inference_steps: 4,
          },
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const immediateOutput = this.extractReplicateOutput(data);
    if (immediateOutput) {
      await this.downloadToFile(immediateOutput, outputPath);
      return { provider: 'replicate', sourceUrl: immediateOutput };
    }

    const pollUrl = data.urls && data.urls.get;
    if (!pollUrl) {
      return null;
    }

    for (let attempt = 0; attempt < 40; attempt += 1) {
      await this.sleep(2000);

      const pollResponse = await this.fetch(pollUrl, {
        headers: { Authorization: `Bearer ${this.replicateToken}` },
      });

      if (!pollResponse.ok) {
        continue;
      }

      const pollData = await pollResponse.json();
      if (pollData.status === 'failed' || pollData.status === 'canceled') {
        return null;
      }

      const outputUrl = this.extractReplicateOutput(pollData);
      if (outputUrl) {
        await this.downloadToFile(outputUrl, outputPath);
        return { provider: 'replicate', sourceUrl: outputUrl };
      }
    }

    return null;
  }

  extractImageUrl(result) {
    if (!result) {
      return null;
    }

    if (Array.isArray(result.images) && result.images.length > 0) {
      return result.images[0].url || result.images[0].image_url || null;
    }

    if (result.image && typeof result.image === 'string') {
      return result.image;
    }

    if (Array.isArray(result.output) && result.output.length > 0) {
      return result.output[0];
    }

    return null;
  }

  extractReplicateOutput(result) {
    if (!result || !result.output) {
      return null;
    }

    if (Array.isArray(result.output) && result.output.length > 0) {
      return typeof result.output[0] === 'string' ? result.output[0] : result.output[0].url;
    }

    if (typeof result.output === 'string') {
      return result.output;
    }

    return null;
  }

  async downloadToFile(url, outputPath) {
    const response = await this.fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download generated image from ${url}`);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, bytes);
  }

  async createPlaceholderImage(outputPath, index) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
        <defs>
          <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#1E1E2E" />
            <stop offset="100%" stop-color="#00FFFF" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1350" fill="url(#bg)" />
        <text x="80" y="220" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="82" font-weight="700">
          Card ${index}
        </text>
      </svg>
    `;

    fs.writeFileSync(outputPath, svg.trim(), 'utf8');
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = {
  CarouselImageService,
};
