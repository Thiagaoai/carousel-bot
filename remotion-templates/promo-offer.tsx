import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { PromoOfferProps } from './types';

// Duration: 15 seconds @ 30fps = 450 frames
// 0-3s: Attention text pulse ("LIMITED TIME")
// 3-8s: Offer details
// 8-12s: Urgency element
// 12-15s: CTA + contact

export const PromoOffer: React.FC<PromoOfferProps> = ({
  brand,
  attentionText,
  offerTitle,
  offerDetail,
  offerValue,
  ctaText,
  contactInfo,
  logoUrl,
  backgroundImage,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phase1End = 3 * fps;   // 90
  const phase2End = 8 * fps;   // 240
  const phase3End = 12 * fps;  // 360

  // Phase 1: Pulse animation
  const pulseScale =
    1 + 0.08 * Math.sin((frame / fps) * Math.PI * 4); // 4 pulses in 3 sec

  const attentionSpring = spring({ frame, fps, config: { damping: 8, stiffness: 200 } });

  // Phase 2: Offer entrance
  const offerSpring = spring({
    frame: frame - phase1End,
    fps,
    config: { damping: 12 },
  });

  // Phase 3: Badge pulse
  const badgePulse = 1 + 0.05 * Math.sin(((frame - phase2End) / fps) * Math.PI * 3);
  const badgeSpring = spring({
    frame: frame - phase2End,
    fps,
    config: { damping: 10 },
  });

  // Phase 4: CTA
  const ctaSpring = spring({
    frame: frame - phase3End,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.primary }}>
      {/* Background image (dimmed) */}
      {backgroundImage && (
        <AbsoluteFill>
          <Img
            src={backgroundImage}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.15,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Radial gradient overlay */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, ${brand.colors.primary} 80%)`,
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 50,
        }}
      >
        {/* Phase 1: Attention text */}
        <div
          style={{
            transform: `scale(${frame < phase1End ? pulseScale * interpolate(attentionSpring, [0, 1], [0.5, 1]) : 1})`,
            opacity: frame >= phase2End
              ? interpolate(frame, [phase2End, phase2End + 10], [1, 0], { extrapolateRight: 'clamp' })
              : attentionSpring,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              backgroundColor: brand.colors.accent,
              color: brand.colors.primary,
              padding: '14px 40px',
              borderRadius: 8,
              fontSize: 28,
              fontFamily: brand.font,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            {attentionText}
          </div>
        </div>

        {/* Phase 2: Offer details */}
        {frame >= phase1End && (
          <div
            style={{
              textAlign: 'center',
              opacity: offerSpring,
              transform: `translateY(${interpolate(offerSpring, [0, 1], [50, 0])}px)`,
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontFamily: brand.font,
                color: brand.colors.accent,
                marginBottom: 16,
              }}
            >
              {offerTitle}
            </div>
            <div
              style={{
                fontSize: 64,
                fontFamily: brand.font,
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.2,
                marginBottom: 20,
              }}
            >
              {offerDetail}
            </div>
            {offerValue && (
              <div
                style={{
                  fontSize: 30,
                  fontFamily: brand.font,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {offerValue}
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Urgency badge */}
        {frame >= phase2End && frame < phase3End + 20 && (
          <div
            style={{
              marginTop: 40,
              transform: `scale(${badgePulse * interpolate(badgeSpring, [0, 1], [0, 1])})`,
              opacity: badgeSpring,
            }}
          >
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                backgroundColor: brand.colors.accent,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: `0 0 40px ${brand.colors.accent}40`,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontFamily: brand.font,
                  color: brand.colors.primary,
                  fontWeight: 700,
                }}
              >
                ACT NOW
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontFamily: brand.font,
                  color: brand.colors.primary,
                  opacity: 0.7,
                }}
              >
                Limited availability
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: CTA + Contact */}
        {frame >= phase3End && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '60px 50px 80px',
              textAlign: 'center',
              opacity: ctaSpring,
              transform: `translateY(${interpolate(ctaSpring, [0, 1], [60, 0])}px)`,
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
                backgroundColor: brand.colors.accent,
                color: brand.colors.primary,
                padding: '20px 50px',
                borderRadius: 12,
                fontSize: 34,
                fontFamily: brand.font,
                fontWeight: 700,
                display: 'inline-block',
                marginBottom: 20,
              }}
            >
              {ctaText}
            </div>
            <div
              style={{
                fontSize: 28,
                fontFamily: brand.font,
                color: '#fff',
                marginTop: 10,
              }}
            >
              {contactInfo}
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
