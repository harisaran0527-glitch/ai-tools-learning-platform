import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeConfig, PageTarget } from '../types/theme';
import { ORIGINAL_AI_VERSE_PRESET, BUILT_IN_PRESETS } from '../data/themePresets';
import { api } from '../lib/platform';
import { BackgroundLayer } from '../components/theme/BackgroundLayer';

interface ThemeContextType {
  currentTheme: ThemeConfig;
  globalTheme: ThemeConfig;
  previewTheme: ThemeConfig | null;
  setPreviewTheme: (theme: ThemeConfig | null) => void;
  pageTarget: PageTarget;
  isPaused: boolean;
  togglePaused: () => void;
  refreshThemes: () => Promise<void>;
  publishedBindings: Record<PageTarget, ThemeConfig>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ai_verse_theme_bindings_v1';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  // Load initial bindings from localStorage or default
  const [bindings, setBindings] = useState<Record<PageTarget, ThemeConfig>>(() => {
    try {
      const saved = null;
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse failure
    }
    return {
      global: ORIGINAL_AI_VERSE_PRESET,
      home: ORIGINAL_AI_VERSE_PRESET,
      catalog: ORIGINAL_AI_VERSE_PRESET,
      tool_detail: ORIGINAL_AI_VERSE_PRESET,
      prompting: ORIGINAL_AI_VERSE_PRESET,
      prompting_practice: ORIGINAL_AI_VERSE_PRESET,
      admin: ORIGINAL_AI_VERSE_PRESET,
      admin_login: ORIGINAL_AI_VERSE_PRESET,
      assessment: ORIGINAL_AI_VERSE_PRESET,
    };
  });

  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ai_verse_motion_paused') === 'true';
    } catch {
      return false;
    }
  });

  const togglePaused = () => {
    setIsPaused((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ai_verse_motion_paused', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Determine current page target from location
  const getPageTarget = useCallback((): PageTarget => {
    const path = location.pathname;
    if (path === '/') {
      return location.hash === '#catalog-section' ? 'catalog' : 'home';
    }
    if (path.startsWith('/tools/')) return 'tool_detail';
    if (path === '/prompting/practice') return 'prompting_practice';
    if (path.startsWith('/prompting')) return 'prompting';
    if (path.startsWith('/assessment/') || path.startsWith('/results/')) return 'assessment';
    if (path.startsWith('/admin')) return 'admin';
    return 'global';
  }, [location.pathname, location.hash]);

  const pageTarget = getPageTarget();

  // Fetch published theme bindings from API
  const refreshThemes = useCallback(async () => {
    try {
      const data = await api<Record<PageTarget, ThemeConfig>>('theme');
      if (data && typeof data === 'object') {
        setBindings((prev) => {
          const updated = { ...data, global: data.global || ORIGINAL_AI_VERSE_PRESET } as Record<PageTarget, ThemeConfig>;
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          } catch {
            // Ignore storage quota
          }
          return updated;
        });
      }
    } catch {
      // Preserve bundled default availability
    }
  }, []);

  useEffect(() => {
    refreshThemes();
  }, [refreshThemes]);

  // Resolve current active theme:
  // 1. If previewTheme is active (in Theme Studio preview), use it.
  // 2. Else check page-specific binding.
  // 3. Else fallback to global binding.
  // 4. Else fallback to immutable default preset.
  const currentTheme =
    previewTheme ||
    bindings[pageTarget] ||
    bindings.global ||
    ORIGINAL_AI_VERSE_PRESET;

  const globalTheme = bindings.global || ORIGINAL_AI_VERSE_PRESET;

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        globalTheme,
        previewTheme,
        setPreviewTheme,
        pageTarget,
        isPaused,
        togglePaused,
        refreshThemes,
        publishedBindings: bindings,
      }}
    >
      {currentTheme.id !== ORIGINAL_AI_VERSE_PRESET.id && <BackgroundLayer theme={currentTheme} paused={isPaused} />}
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
