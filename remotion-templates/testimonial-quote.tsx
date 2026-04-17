import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { TestimonialQuoteProps } from './types';

// Duration: 20 seconds @ 30fps = 600 frames
// 0-3s: Star rating animation
// 3-15s: Quote typewriter + avatar
// 15-18s: Customer name fade in
// 18-20s: Logo + CTA

export const TestimonialQuote: React.FC<TestimonialQuoteProps> = ({
  brand,
  quote,
  customerName,
  customerTitle,
  avatarUrl,
  rating,
  ctaText,
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phase1End = 3 * fps;   // 90
  const phase2End = 15 * fps;  // 450
  const phase3End = 18 * fps;  // 540

  // Phase 1: Stars
  const starAnimations = Array.from({ length: 5 }, (_, i) => {
    const s = spring({
      frame: frame - i * 12,
      fps,
      config: { damping: 8, stiffness: 200 },
    });
    return {
      scale: interpolate(s, [0, 1], [0, i < rating ? 1 : 0.3]),
      opacity: interpolate(s, [0, 1], [0, i < rating ? 1 : 0.2]),
    };
  });

  // Phase 2: Typewriter effect
  const charsToShow = Math.floor(
    interpolate(
      frame,
      [phase1End, phase2End - 30],
      [0, quote.length],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    )
  );
  const visibleQuote = quote.slice(0, charsToShow);

  // Phase 2: Avatar
  const avatarSpring = spring({
    frame: frame - phase1End - 10,
    fps,
    config: { damping: 12 },
  });

  // Phase 3: Name entrance
  const nameSpring = spring({
    frame: frame - phase2End,
    fps,
    config: { damping: 12 },
  });

  // Phase 4: CTA
  const ctaSpring = spring({
    frame: frame - phase3End,
    fps,
    config: { damping: 10 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
      }}
    >
      {/* Decorative quote mark */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 40,
          fontSize: 200,
          fontFamily: 'Georgia, serif',
          color: brand.colors.accent,
          opacity: 0.15,
          lineHeight: 1,
        }}
      >
        {'\u201C'}
      </div>

      {/* Stars */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 50,
        }}
      >
        {starAnimations.map((star, i) => (
          <div
            key={i}
            style={{
              fontSize: 48,
              transform: `scale(${star.scale})`,
              opacity: star.opacity,
              color: brand.colors.accent,
            }}
          >
            {'\u2605'}
          </div>
        ))}
      </div>

      {/* Avatar */}
      {avatarUrl && (
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `4px solid ${brand.colors.accent}`,
            marginBottom: 40,
            transform: `scale(${interpolate(avatarSpring, [0, 1], [0, 1])})`,
          }}
        >
          <Img
            src={avatarUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Quote */}
      <div
        style={{
          fontSize: 36,
          fontFamily: brand.font,
          color: '#fff',
          textAlign: 'center',
          lineHeight: 1.5,
          maxWidth: 900,
          minHeight: 250,
        }}
      >
        &ldquo;{visibleQuote}&rdquo;
      </div>

      {/* Customer name */}
      <div
        style={{
          marginTop: 40,
          opacity: nameSpring,
          transform: `translateY(${interpolate(nameSpring, [0, 1], [20, 0])}px)`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontFamily: brand.font,
            fontWeight: 700,
            color: brand.colors.accent,
          }}
        >
          {customerName}
        </div>
        {customerTitle && (
          <div
            style={{
              fontSize: 20,
              fontFamily: brand.font,
              color: 'rgba(255,255,255,0.6)',
              marginTop: 6,
            }}
          >
            {customerTitle}
          </div>
        )}
      </div>

      {/* CTA + Logo */}
      {frame >= phase3End && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: ctaSpring,
            transform: `translateY(${interpolate(ctaSpring, [0, 1], [40, 0])}px)`,
          }}
        >
          {logoUrl && (
            <Img
              src={logoUrl}
              style={{
                width: 100,
                height: 100,
                objectFit: 'contain',
                margin: '0 auto 20px',
              }}
            />
          )}
          <div
            style={{
              fontSize: 26,
              fontFamily: brand.font,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {ctaText}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
