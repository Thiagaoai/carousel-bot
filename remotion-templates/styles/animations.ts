// Shared animation utilities for Remotion templates
// Resolution: 1080x1920 (9:16 Instagram Reels)

export const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  codec: 'h264' as const,
  bitrate: '5000k',
};

export const DURATIONS = {
  'before-after': 30,
  'service-showcase': 30,
  'testimonial-quote': 20,
  'educational-tips': 45,
  'promo-offer': 15,
};

// Easing functions
export const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const easeOut = (t: number): number =>
  t * (2 - t);

// Frame helpers
export const secondsToFrames = (seconds: number, fps = 30): number =>
  Math.round(seconds * fps);

export const framesToSeconds = (frames: number, fps = 30): number =>
  frames / fps;
