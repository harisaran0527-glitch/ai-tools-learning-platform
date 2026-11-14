import React, { useRef, useEffect, useState } from 'react';
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
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isSaveData, setIsSaveData] = useState(false);

  // Check reduced-motion and data-saver preferences
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);

      if (typeof navigator !== 'undefined' && (navigator as any).connection?.saveData) {
        setIsSaveData(Boolean((navigator as any).connection.saveData));
      }

      return () => mediaQuery.removeEventListener('change', listener);
    } catch {
      // Ignore in non-browser / test environments
    }
  }, []);

  // Safe playback and speed controller with autoplay fallback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !theme.videoUrl) return;

    video.playbackRate = theme.videoSettings?.speed || 1.0;

    if (paused || isReducedMotion || isSaveData) {
      video.pause();
      return;
    }

    if (theme.videoSettings?.autoplay ?? true) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked by browser policy; gracefully stays on poster frame without throwing
        });
      }
    }
  }, [theme.videoUrl, paused, isReducedMotion, isSaveData, theme.videoSettings?.speed, theme.videoSettings?.autoplay]);

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
  const hasVideo = Boolean(
    theme.videoUrl &&
      (theme.bgType === 'cinematic' ||
        theme.bgType === 'video' ||
        theme.motionType === 'video' ||
        (!['solid', 'gradient', 'image', 'preset'].includes(theme.bgType) && theme.videoUrl))
  );

  const videoDarkness = theme.videoSettings?.darkOverlay ?? 0.45;
  const staticFallbackPoster = theme.videoSettings?.staticFallbackUrl || theme.imageUrl || '/images/anime-ai-hero.jpg';

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
      {bgLayer.enabled && (theme.bgType === 'gradient' || theme.bgType === 'cosmic' || theme.bgType === 'cinematic' || theme.bgType === 'video') && (
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
            overflow: 'hidden',
          }}
        >
          {/* Static Fallback Poster for Reduced Motion / Data-saver / Loading */}
          {(isReducedMotion || isSaveData) ? (
            <div
              className="theme-video-fallback-poster"
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url('${staticFallbackPoster}')`,
                backgroundSize: 'cover',
                backgroundPosition: theme.videoSettings?.position || 'center center',
              }}
            />
          ) : (
            <video
              ref={videoRef}
              src={theme.videoUrl}
              poster={staticFallbackPoster}
              loop={theme.videoSettings?.loop ?? true}
              autoPlay={theme.videoSettings?.autoplay ?? true}
              muted={theme.videoSettings?.muted ?? true}
              playsInline
              preload="metadata"
              style={{
                width: '100%',
                height: '100%',
                objectFit: (theme.videoSettings?.fit as any) || 'cover',
                objectPosition: theme.videoSettings?.position || 'center center',
                display: 'block',
              }}
            />
          )}

          {/* Video Text Readability Vignette Overlay */}
          <div
            className="theme-video-readability-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(90deg, rgba(7, 9, 19, ${Math.min(0.95, videoDarkness + 0.35)}) 0%, rgba(7, 9, 19, ${videoDarkness}) 52%, rgba(7, 9, 19, ${Math.max(0.1, videoDarkness - 0.2)}) 100%)`,
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        </div>
      )}

      {/* 4. MOTION & CANVAS ANIMATION LAYER */}
      {motionLayer.enabled && theme.motionType !== 'none' && theme.motionType !== 'video' && (
        <div
          className="theme-layer-motion"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 4,
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
            zIndex: 5,
          }}
        />
      )}

      {/* 6. GLOBAL READABILITY OVERLAY / VIGNETTE LAYER */}
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
            zIndex: 6,
          }}
        />
      )}
    </div>
  );
};
