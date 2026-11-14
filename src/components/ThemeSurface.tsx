import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { BackgroundLayer } from './theme/BackgroundLayer';
import { ThemeConfig } from '../types/theme';

export function ThemeSurface({ theme }: { theme: ThemeConfig }) {
  const { isPaused } = useTheme();
  return <BackgroundLayer theme={theme} paused={isPaused} />;
}

export function PublishedTheme() {
  const { currentTheme, isPaused } = useTheme();

  // If current theme is the immutable default preset, keep the standard background
  if (!currentTheme || currentTheme.id === 'preset-original-default') {
    return null;
  }

  return (
    <div className="published-theme" aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <BackgroundLayer theme={currentTheme} paused={isPaused} />
    </div>
  );
}
