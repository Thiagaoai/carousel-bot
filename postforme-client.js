const fs = require('fs');
const path = require('path');

class PostformeClient {
  constructor({ apiKey, instagramId, fetchImpl } = {}) {
    this.apiKey = apiKey || process.env.POSTFORME_API_KEY || '';
    this.instagramId =
      String(instagramId || process.env.POSTFORME_IG_ID || process.env.INSTAGRAM_BUSINESS_ID || '');
    this.fetch = fetchImpl || fetch;
    this.baseUrl = 'https://api.postforme.dev';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.instagramId);
  }

  async publishCarousel(imagePaths, caption) {
    if (!this.isConfigured()) {
      throw new Error('PostForMe is not configured');
    }

    const media = [];

    for (const imagePath of imagePaths) {
      const uploaded = await this.uploadImage(imagePath);
      media.push(uploaded);
    }

    const response = await this.fetch(`${this.baseUrl}/v1/social-posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        social_accounts: [this.instagramId],
        media,
        caption,
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`PostForMe social-posts failed: ${text.slice(0, 300)}`);
    }

    const data = this.safeJson(text);
    return {
      postformeId: data && (data.id || data.post_id || data.social_post_id || null),
      instagramUrl: data && (data.instagram_url || data.post_url || data.url || null),
      raw: data || text,
    };
  }

  async uploadImage(imagePath) {
    const contentType = this.getContentType(imagePath);
    const filename = path.basename(imagePath);
    const imageBuffer = fs.readFileSync(imagePath);

    const createResponse = await this.fetch(`${this.baseUrl}/v1/media/create-upload-url`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        content_type: contentType,
      }),
    });

    const createText = await createResponse.text();
    if (createResponse.ok) {
      const uploadData = this.safeJson(createText) || {};
      const uploadUrl = uploadData.upload_url || uploadData.uploadUrl || uploadData.signedUrl;

      if (uploadUrl) {
        const uploadResponse = await this.fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: imageBuffer,
        });

        if (uploadResponse.ok) {
          const mediaEntry = { type: 'image' };
          const mediaId = uploadData.id || uploadData.media_id || uploadData.mediaId;
          const mediaUrl =
            uploadData.url || uploadData.media_url || uploadData.mediaUrl || uploadData.fileUrl;

          if (mediaId) {
            mediaEntry.id = mediaId;
          }

          if (mediaUrl) {
            mediaEntry.url = mediaUrl;
          }

          return mediaEntry;
        }
      }
    }

    return {
      type: 'image',
      filename,
      content_type: contentType,
      base64: imageBuffer.toString('base64'),
    };
  }

  getContentType(imagePath) {
    const ext = path.extname(imagePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      return 'image/jpeg';
    }

    if (ext === '.svg') {
      return 'image/svg+xml';
    }

    return 'image/png';
  }

  safeJson(value) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}

module.exports = {
  PostformeClient,
};
