'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  themes,
  defaultThemeId,
  getTheme,
  availableThemesList,
  type ThemeDefinition,
  type ThemeTokens,
} from '../../lib/theme-tokens';

interface ThemeContextType {
  currentThemeId: string;
  currentTheme: ThemeDefinition;
  setTheme: (themeId: string) => void;
  availableThemes: ThemeDefinition[];
  isDark: boolean;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'uma_erp_theme_preference';

function cssVarMap(tokens: ThemeDefinition): Record<string, string> {
  const c = tokens.colors;
  const baseMap: Record<string, string> = {
    '--color-primary': c.primary.DEFAULT,
    '--color-primary-hover': c.primary.hover,
    '--color-primary-light': c.primary.light,
    '--color-primary-contrast': c.primary.contrast,
    '--color-accent': c.accent.DEFAULT,
    '--color-accent-bg': c.accent.bg,
    '--color-info': c.info.DEFAULT,
    '--color-info-bg': c.info.bg,
    '--color-info-text': c.info.text,
    '--color-success': c.success.DEFAULT,
    '--color-success-bg': c.success.bg,
    '--color-success-text': c.success.text,
    '--color-danger': c.danger.DEFAULT,
    '--color-danger-bg': c.danger.bg,
    '--color-danger-text': c.danger.text,
    '--color-purple': c.purple.DEFAULT,
    '--color-purple-bg': c.purple.bg,
    '--color-purple-text': c.purple.text,
    '--color-bg-app': c.background.app,
    '--color-bg-surface': c.background.surface,
    '--color-bg-sidebar': c.background.sidebar,
    '--color-border': c.border,
    '--color-text-primary': c.text.primary,
    '--color-text-secondary': c.text.secondary,
    '--color-text-muted': c.text.muted,
  };

  return {
    ...baseMap,
    ...tokens.crmVars,
  };
}

export function ClientThemeProvider({
  clientThemeId = defaultThemeId,
  children,
}: {
  clientThemeId?: string | null;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [themeId, setThemeId] = useState<string>(clientThemeId || defaultThemeId);

  const activeTheme = getTheme(themeId);

  const applyThemeToDOM = useCallback((tokens: ThemeDefinition) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const vars = cssVarMap(tokens);

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.setAttribute('data-theme', tokens.id);

    if (tokens.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && themes[saved]) {
        setThemeId(saved);
        applyThemeToDOM(themes[saved]);
        return;
      }
    } catch {
      // Storage access blocked or restricted
    }
    applyThemeToDOM(activeTheme);
  }, [applyThemeToDOM]);

  useEffect(() => {
    if (mounted) {
      applyThemeToDOM(activeTheme);
    }
  }, [activeTheme, applyThemeToDOM, mounted]);

  const handleSetTheme = useCallback(
    (newThemeId: string) => {
      if (!themes[newThemeId]) return;
      setThemeId(newThemeId);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newThemeId);
      } catch {
        // Ignore storage errors
      }
      applyThemeToDOM(themes[newThemeId]);
    },
    [applyThemeToDOM]
  );

  return (
    <ThemeContext.Provider
      value={{
        currentThemeId: themeId,
        currentTheme: activeTheme,
        setTheme: handleSetTheme,
        availableThemes: availableThemesList,
        isDark: activeTheme.isDark,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      currentThemeId: defaultThemeId,
      currentTheme: getTheme(defaultThemeId),
      setTheme: () => {},
      availableThemes: availableThemesList,
      isDark: false,
      mounted: false,
    };
  }
  return context;
}

export { themes, defaultThemeId, getTheme };
