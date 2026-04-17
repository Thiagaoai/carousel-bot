import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { BeforeAfterProps } from './types';

// Duration: 30 seconds @ 30fps = 900 frames
// 0-5s: "Before" full screen with label
// 5-15s: Animated slider reveals "After"
// 15-25s: Side-by-side with brand overlay
// 25-30s: Logo + CTA + contact

export const BeforeAfterReveal: React.FC<BeforeAfterProps> = ({
  brand,
  beforeImage,
  afterImage,
  headline,
  location,
  ctaText,
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase timings (in frames)
  const phase1End = 5 * fps;   // 150
  const phase2End = 15 * fps;  // 450
  const phase3End = 25 * fps;  // 750
  // phase4 = 750-900

  // Phase 1: Before label fade in
  const labelOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Phase 2: Slider reveal (0% to 100%)
  const sliderProgress = interpolate(
    frame,
    [phase1End, phase2End],
    [0, 100],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Phase 3: Side-by-side scale
  const sideBySideOpacity = interpolate(
    frame,
    [phase2End, phase2End + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Phase 4: CTA entrance
  const ctaSpring = spring({
    frame: frame - phase3End,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const ctaTranslateY = interpolate(ctaSpring, [0, 1], [80, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Phase 1 & 2: Full screen with slider */}
      {frame < phase2End + 20 && (
        <AbsoluteFill>
          {/* Before image (full) */}
          <Img
            src={beforeImage}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
            }}
          />

          {/* After image (clipped by slider) */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              clipPath: `inset(0 ${100 - sliderProgress}% 0 0)`,
            }}
          >
            <Img
              src={afterImage}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Slider line */}
          {frame >= phase1End && frame < phase2End + 20 && (
            <div
              style={{
                position: 'absolute',
                left: `${sliderProgress}%`,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: brand.colors.accent,
                boxShadow: `0 0 20px ${brand.colors.accent}`,
              }}
            />
          )}

          {/* Before label */}
          {frame < phase1End && (
            <div
              style={{
                position: 'absolute',
                top: 80,
                left: 40,
                opacity: labelOpacity,
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '12px 28px',
                  borderRadius: 8,
                  fontSize: 36,
                  fontFamily: brand.font,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                BEFORE
              </div>
            </div>
          )}

          {/* After label */}
          {frame >= phase1End && sliderProgress > 30 && (
            <div
              style={{
                position: 'absolute',
                top: 80,
                right: 40,
              }}
            >
              <div
                style={{
                  backgroundColor: brand.colors.primary,
                  color: '#fff',
                  padding: '12px 28px',
                  borderRadius: 8,
                  fontSize: 36,
                  fontFamily: brand.font,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                AFTER
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}

      {/* Phase 3: Side by side */}
      {frame >= phase2End && frame < phase3End + 30 && (
        <AbsoluteFill style={{ opacity: sideBySideOpacity }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Headline */}
            <div
              style={{
                backgroundColor: brand.colors.primary,
                padding: '40px 30px 20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  color: '#fff',
                  fontSize: 42,
                  fontFamily: brand.font,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {headline}
              </div>
              <div
                style={{
                  color: brand.colors.accent,
                  fontSize: 24,
                  fontFamily: brand.font,
                  marginTop: 8,
                }}
              >
                {location}
              </div>
            </div>

            {/* Side by side images */}
            <div style={{ flex: 1, display: 'flex', gap: 4, padding: 4 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Img
                  src={beforeImage}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: 4,
                    fontSize: 22,
                    fontFamily: brand.font,
                  }}
                >
                  Before
                </div>
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <Img
                  src={afterImage}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    backgroundColor: brand.colors.primary,
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: 4,
                    fontSize: 22,
                    fontFamily: brand.font,
                  }}
                >
                  After
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 4: CTA */}
      {frame >= phase3End && (
        <AbsoluteFill
          style={{
            backgroundColor: brand.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {logoUrl && (
            <Img
              src={logoUrl}
              style={{ width: 200, height: 200, objectFit: 'contain', marginBottom: 40 }}
            />
          )}
          <div
            style={{
              transform: `translateY(${ctaTranslateY}px)`,
              textAlign: 'center',
              padding: '0 60px',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontFamily: brand.font,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 30,
              }}
            >
              {ctaText}
            </div>
            <div
              style={{
                backgroundColor: brand.colors.accent,
                color: brand.colors.primary,
                padding: '20px 60px',
                borderRadius: 12,
                fontSize: 32,
                fontFamily: brand.font,
                fontWeight: 700,
                display: 'inline-block',
              }}
            >
              Get a Free Quote
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'rgba(255,255,255,0.6)',
          padding: '4px 10px',
          borderRadius: 4,
          fontSize: 14,
          fontFamily: 'sans-serif',
        }}
      >
        {brand.name}
      </div>
    </AbsoluteFill>
  );
};
