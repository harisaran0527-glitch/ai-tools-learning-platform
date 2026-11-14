import React, { useRef, useEffect } from 'react';
import { ThemeConfig } from '../../types/theme';
import { ThemeCanvas } from './ThemeCanvas';

interface BackgroundLayerProps {
  theme: ThemeConfig;
  paused?: boolean;
  isHeroOverlayOnly?: boolean; // When true, rendered inside hero specifically
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  theme,
  paused = false,
  isHeroOverlayOnly = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Apply video speed when videoUrl is present
  useEffect(() => {
    if (videoRef.current && theme.videoUrl) {
      videoRef.current.playbackRate = theme.videoSettings.speed || 1.0;
    }
  }, [theme.videoUrl, theme.videoSettings?.speed]);

  // Derive gradient CSS string
  const gradientCss = theme.gradient?.stops?.length
    ? `linear-gradient(${theme.gradient.angle || 135}deg, ${theme.gradient.stops
        .map((s) => `${s.color} ${s.position}%`)
        .join(', ')})`
    : 'none';

  // Find layer settings
  const bgLayer = theme.layers.find((l) => l.type === 'background') || { enabled: true, opacity: 1 };
  const motionLayer = theme.layers.find((l) => l.type === 'motion') || { enabled: true, opacity: 0.8 };
  const overlayLayer = theme.layers.find((l) => l.type === 'overlay') || { enabled: true, opacity: 0.5 };
  const glowLayer = theme.layers.find((l) => l.type === 'glow') || { enabled: true, opacity: 0.4 };

  const hasImage = Boolean(theme.imageUrl && (theme.bgType === 'image' || theme.bgType === 'preset'));
  const hasVideo = Boolean(theme.videoUrl && theme.bgType === 'cinematic');

  return (
    <div
      className={`theme-background-container ${isHeroOverlayOnly ? 'hero-theme-bound' : 'global-theme-bound'}`}
      style={{
        position: isHeroOverlayOnly ? 'absolute' : 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: theme.solidColor || '#070913',
      }}
    >
      {/* 1. GRADIENT BASE LAYER */}
      {bgLayer.enabled && (theme.bgType === 'gradient' || theme.bgType === 'cosmic' || theme.bgType === 'cinematic') && (
        <div
          className="theme-layer-gradient"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: gradientCss,
            opacity: bgLayer.opacity,
            zIndex: 1,
          }}
        />
      )}

      {/* 2. IMAGE BACKGROUND LAYER */}
      {bgLayer.enabled && hasImage && (
        <div
          className="theme-layer-image"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${theme.imageUrl}')`,
            backgroundSize: theme.imageSettings?.size || 'cover',
            backgroundPosition: theme.imageSettings?.position || 'center',
            transform: `scale(${((theme.imageSettings?.zoom || 100) / 100)})`,
            filter: `brightness(${theme.imageSettings?.brightness || 100}%) contrast(${theme.imageSettings?.contrast || 100}%) blur(${theme.imageSettings?.blur || 0}px)`,
            opacity: (bgLayer.opacity * (theme.imageSettings?.opacity || 100)) / 100,
            zIndex: 2,
            transition: 'opacity 0.3s ease, filter 0.3s ease',
          }}
        />
      )}

      {/* 3. VIDEO BACKGROUND LAYER */}
      {bgLayer.enabled && hasVideo && (
        <div
          className="theme-layer-video"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            opacity: bgLayer.opacity,
          }}
        >
          <video
            ref={videoRef}
            src={theme.videoUrl}
            poster={theme.videoSettings?.staticFallbackUrl || theme.imageUrl}
            loop={theme.videoSettings?.loop ?? true}
            autoPlay={theme.videoSettings?.autoplay ?? true}
            muted={theme.videoSettings?.muted ?? true}
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {/* 4. MOTION & CANVAS ANIMATION LAYER */}
      {motionLayer.enabled && theme.motionType !== 'none' && (
        <div
          className="theme-layer-motion"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            opacity: motionLayer.opacity,
          }}
        >
          <ThemeCanvas
            motionType={theme.motionType}
            settings={theme.motionSettings}
            opacity={motionLayer.opacity}
            paused={paused}
            interactive={true}
          />
        </div>
      )}

      {/* 5. AMBIENT GLOW LAYER */}
      {glowLayer.enabled && (
        <div
          className="theme-layer-glow"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 15% 20%, rgba(124, 58, 237, 0.18) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
            opacity: glowLayer.opacity,
            zIndex: 4,
          }}
        />
      )}

      {/* 6. READABILITY OVERLAY / VIGNETTE LAYER */}
      {overlayLayer.enabled && theme.overlay?.enabled && (
        <div
          className="theme-layer-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: theme.overlay.color || '#070913',
            opacity: overlayLayer.opacity * (theme.overlay.opacity ?? 0.5),
            backdropFilter: theme.overlay.blur ? `blur(${theme.overlay.blur}px)` : undefined,
            WebkitBackdropFilter: theme.overlay.blur ? `blur(${theme.overlay.blur}px)` : undefined,
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
};
