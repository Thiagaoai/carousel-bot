import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { ServiceShowcaseProps } from './types';

// Duration: 30 seconds @ 30fps = 900 frames
// 0-5s: Company name + tagline entrance
// 5-20s: 4-panel grid, each slides in
// 20-25s: Full-width hero shot
// 25-30s: Logo + CTA

export const ServiceShowcase: React.FC<ServiceShowcaseProps> = ({
  brand,
  headline,
  tagline,
  services,
  heroImage,
  ctaText,
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phase1End = 5 * fps;
  const phase2End = 20 * fps;
  const phase3End = 25 * fps;

  // Phase 1: Title entrance
  const titleSpring = spring({ frame, fps, config: { damping: 15 } });
  const titleScale = interpolate(titleSpring, [0, 1], [0.8, 1]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Phase 2: Grid panels slide in staggered
  const panelEntrance = (index: number) => {
    const delay = phase1End + index * 25; // 25 frames apart
    const s = spring({
      frame: frame - delay,
      fps,
      config: { damping: 12, stiffness: 80 },
    });
    return {
      translateY: interpolate(s, [0, 1], [200, 0]),
      opacity: interpolate(s, [0, 1], [0, 1]),
    };
  };

  // Phase 3: Hero image
  const heroOpacity = interpolate(
    frame,
    [phase2End, phase2End + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const heroScale = interpolate(
    frame,
    [phase2End, phase2End + 30],
    [1.1, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Phase 4: CTA
  const ctaSpring = spring({
    frame: frame - phase3End,
    fps,
    config: { damping: 12 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.primary }}>
      {/* Phase 1: Title */}
      {frame < phase1End + 30 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: frame >= phase1End ? interpolate(frame, [phase1End, phase1End + 15], [1, 0], { extrapolateRight: 'clamp' }) : titleOpacity,
          }}
        >
          <div
            style={{
              transform: `scale(${titleScale})`,
              textAlign: 'center',
              padding: '0 60px',
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontFamily: brand.font,
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.2,
              }}
            >
              {headline}
            </div>
            <div
              style={{
                fontSize: 28,
                fontFamily: brand.font,
                color: brand.colors.accent,
                marginTop: 16,
              }}
            >
              {tagline}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 2: 4-panel grid */}
      {frame >= phase1End && frame < phase2End + 20 && (
        <AbsoluteFill style={{ padding: 24 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 16,
              height: '100%',
              paddingTop: 60,
              paddingBottom: 60,
            }}
          >
            {services.map((service, i) => {
              const anim = panelEntrance(i);
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: brand.colors.secondary,
                    borderRadius: 16,
                    overflow: 'hidden',
                    opacity: anim.opacity,
                    transform: `translateY(${anim.translateY}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Img
                    src={service.image}
                    style={{
                      width: '100%',
                      flex: 1,
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      padding: '16px 12px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 4 }}>
                      {service.icon}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: brand.font,
                        fontWeight: 600,
                        color: '#fff',
                      }}
                    >
                      {service.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* Phase 3: Hero shot */}
      {frame >= phase2End && frame < phase3End + 15 && (
        <AbsoluteFill style={{ opacity: heroOpacity }}>
          <Img
            src={heroImage}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${heroScale})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: `linear-gradient(transparent, ${brand.colors.primary})`,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Phase 4: CTA */}
      {frame >= phase3End && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: brand.colors.primary,
          }}
        >
          {logoUrl && (
            <Img
              src={logoUrl}
              style={{
                width: 180,
                height: 180,
                objectFit: 'contain',
                marginBottom: 40,
                opacity: ctaSpring,
              }}
            />
          )}
          <div
            style={{
              transform: `translateY(${interpolate(ctaSpring, [0, 1], [60, 0])}px)`,
              opacity: ctaSpring,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 44,
                fontFamily: brand.font,
                fontWeight: 700,
                color: '#fff',
                marginBottom: 30,
                padding: '0 40px',
              }}
            >
              {ctaText}
            </div>
            <div
              style={{
                backgroundColor: brand.colors.accent,
                color: brand.colors.primary,
                padding: '18px 50px',
                borderRadius: 12,
                fontSize: 30,
                fontFamily: brand.font,
                fontWeight: 700,
              }}
            >
              Learn More
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
