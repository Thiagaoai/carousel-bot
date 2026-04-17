import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { EducationalTipsProps } from './types';

// Duration: 45 seconds @ 30fps = 1350 frames
// 0-5s: Title card "X Tips for [Topic]"
// 5-15s: Tip 1
// 15-25s: Tip 2
// 25-35s: Tip 3
// 35-45s: "Want more?" + Logo + CTA + follow

export const EducationalTips: React.FC<EducationalTipsProps> = ({
  brand,
  mainTitle,
  tips,
  ctaText,
  ctaAction,
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEnd = 5 * fps;     // 150
  const tip1End = 15 * fps;     // 450
  const tip2End = 25 * fps;     // 750
  const tip3End = 35 * fps;     // 1050

  // Determine current phase
  const getCurrentTipIndex = (): number => {
    if (frame < titleEnd) return -1;
    if (frame < tip1End) return 0;
    if (frame < tip2End) return 1;
    if (frame < tip3End) return 2;
    return 3; // CTA phase
  };

  const tipIndex = getCurrentTipIndex();

  // Title animation
  const titleSpring = spring({ frame, fps, config: { damping: 15 } });

  // Tip entrance animation (relative to tip start)
  const tipEntrance = (startFrame: number) => {
    const s = spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 12, stiffness: 80 },
    });
    return {
      translateX: interpolate(s, [0, 1], [300, 0]),
      opacity: interpolate(s, [0, 1], [0, 1]),
    };
  };

  const tipStarts = [titleEnd, tip1End, tip2End];

  // Progress dots
  const renderProgressDots = () => (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 30 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: tipIndex === i ? 32 : 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: tipIndex >= i ? brand.colors.accent : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s',
          }}
        />
      ))}
    </div>
  );

  // CTA animation
  const ctaSpring = spring({
    frame: frame - tip3End,
    fps,
    config: { damping: 10 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.primary }}>
      {/* Title card */}
      {frame < titleEnd + 15 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: frame >= titleEnd
              ? interpolate(frame, [titleEnd, titleEnd + 15], [1, 0], { extrapolateRight: 'clamp' })
              : 1,
          }}
        >
          <div
            style={{
              transform: `scale(${interpolate(titleSpring, [0, 1], [0.7, 1])})`,
              textAlign: 'center',
              padding: '0 50px',
            }}
          >
            {/* Number badge */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: brand.colors.accent,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 30px',
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontFamily: brand.font,
                  fontWeight: 700,
                  color: brand.colors.primary,
                }}
              >
                3
              </span>
            </div>
            <div
              style={{
                fontSize: 52,
                fontFamily: brand.font,
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.2,
              }}
            >
              {mainTitle}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Tips */}
      {tipIndex >= 0 && tipIndex <= 2 && (
        <AbsoluteFill style={{ padding: '60px 40px' }}>
          {(() => {
            const tip = tips[tipIndex];
            const anim = tipEntrance(tipStarts[tipIndex]);
            return (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  opacity: anim.opacity,
                  transform: `translateX(${anim.translateX}px)`,
                }}
              >
                {/* Tip number */}
                <div
                  style={{
                    fontSize: 24,
                    fontFamily: brand.font,
                    color: brand.colors.accent,
                    marginBottom: 16,
                    letterSpacing: 3,
                  }}
                >
                  TIP {tipIndex + 1} OF 3
                </div>

                {/* Icon */}
                <div style={{ fontSize: 72, marginBottom: 24 }}>
                  {tip.icon}
                </div>

                {/* Title */}
                <div
                  style={{
                    fontSize: 44,
                    fontFamily: brand.font,
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1.3,
                    marginBottom: 20,
                  }}
                >
                  {tip.title}
                </div>

                {/* Description */}
                <div
                  style={{
                    fontSize: 28,
                    fontFamily: brand.font,
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.5,
                  }}
                >
                  {tip.description}
                </div>

                {/* Image (optional) */}
                {tip.image && (
                  <div
                    style={{
                      marginTop: 30,
                      borderRadius: 16,
                      overflow: 'hidden',
                      height: 500,
                    }}
                  >
                    <Img
                      src={tip.image}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Progress dots */}
                {renderProgressDots()}
              </div>
            );
          })()}
        </AbsoluteFill>
      )}

      {/* CTA phase */}
      {frame >= tip3End && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 50,
          }}
        >
          <div
            style={{
              opacity: ctaSpring,
              transform: `scale(${interpolate(ctaSpring, [0, 1], [0.8, 1])})`,
              textAlign: 'center',
            }}
          >
            {logoUrl && (
              <Img
                src={logoUrl}
                style={{
                  width: 140,
                  height: 140,
                  objectFit: 'contain',
                  margin: '0 auto 30px',
                }}
              />
            )}
            <div
              style={{
                fontSize: 48,
                fontFamily: brand.font,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 20,
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
                marginBottom: 30,
              }}
            >
              {ctaAction}
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: brand.font,
              }}
            >
              Follow for more tips
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
