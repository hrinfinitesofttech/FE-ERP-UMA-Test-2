'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  themes,
  defaultThemeId,
  getTheme,
  availableThemesList,
  AVAILABLE_FONTS,
  DEFAULT_DESIGN_CONFIG,
  getRecommendedDesignForTheme,
  type ThemeDefinition,
  type FontOption,
  type DesignStudioConfig,
} from '../../lib/theme-tokens';

interface ThemeContextType {
  currentThemeId: string;
  currentTheme: ThemeDefinition;
  setTheme: (themeId: string) => void;
  designConfig: DesignStudioConfig;
  updateDesignConfig: (config: Partial<DesignStudioConfig>) => void;
  applyRecommendedDesign: () => void;
  resetToDefaults: () => void;
  availableThemes: ThemeDefinition[];
  availableFonts: FontOption[];
  isDark: boolean;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'uma_erp_theme_preference';
const DESIGN_STUDIO_STORAGE_KEY = 'uma_erp_design_studio_config';

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
  const [designConfig, setDesignState] = useState<DesignStudioConfig>(() => {
    return {
      ...DEFAULT_DESIGN_CONFIG,
      themeId: clientThemeId || defaultThemeId,
    };
  });

  const activeTheme = getTheme(themeId);

  const applyDesignToDOM = useCallback(
    (tokens: ThemeDefinition, config: DesignStudioConfig) => {
      if (typeof document === 'undefined') return;
      const root = document.documentElement;

      // 1. Primitive and Semantic Color Variables
      const vars = cssVarMap(tokens);
      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // 2. Data Attributes for Cascading Engine
      root.setAttribute('data-theme', tokens.id);
      root.setAttribute('data-font', config.fontFamily || 'Outfit');
      root.setAttribute('data-card-radius', config.cardRadius || 'smooth');
      root.setAttribute('data-card-border', config.cardBorderWidth || '1');
      root.setAttribute('data-card-shadow', config.cardShadow || 'soft');
      root.setAttribute('data-card-surface', config.cardSurface || 'solid');
      root.setAttribute('data-input-style', config.inputStyle || 'rounded');
      root.setAttribute('data-button-variant', config.buttonVariant || 'gradient');

      // 3. Custom Heading Color
      if (config.headingColor) {
        root.style.setProperty('--erp-heading-color', config.headingColor);
        root.setAttribute('data-has-custom-heading', 'true');
      } else {
        root.style.removeProperty('--erp-heading-color');
        root.removeAttribute('data-has-custom-heading');
      }

      // 4. Custom Body Text Color
      if (config.textColor) {
        root.style.setProperty('--erp-text-color', config.textColor);
        root.setAttribute('data-has-custom-text', 'true');
      } else {
        root.style.removeProperty('--erp-text-color');
        root.removeAttribute('data-has-custom-text');
      }

      // 5. Dark Mode Class
      if (tokens.isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    },
    []
  );

  // Initialize from LocalStorage
  useEffect(() => {
    setMounted(true);
    let initialTheme = clientThemeId || defaultThemeId;
    let initialConfig: DesignStudioConfig = {
      ...DEFAULT_DESIGN_CONFIG,
      themeId: initialTheme,
    };

    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && themes[savedTheme]) {
        initialTheme = savedTheme;
      }
      const savedStudio = localStorage.getItem(DESIGN_STUDIO_STORAGE_KEY);
      if (savedStudio) {
        const parsed = JSON.parse(savedStudio);
        initialConfig = { ...initialConfig, ...parsed, themeId: initialTheme };
      } else {
        initialConfig.themeId = initialTheme;
      }
    } catch {
      // Storage access blocked or restricted
    }

    setThemeId(initialTheme);
    setDesignState(initialConfig);
    applyDesignToDOM(getTheme(initialTheme), initialConfig);
  }, [applyDesignToDOM, clientThemeId]);

  // Keep DOM in sync when activeTheme or designConfig updates
  useEffect(() => {
    if (mounted) {
      applyDesignToDOM(activeTheme, designConfig);
    }
  }, [activeTheme, designConfig, applyDesignToDOM, mounted]);

  // Set Theme Handler
  const handleSetTheme = useCallback(
    (newThemeId: string) => {
      if (!themes[newThemeId]) return;
      setThemeId(newThemeId);
      const updatedConfig = { ...designConfig, themeId: newThemeId };
      setDesignState(updatedConfig);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newThemeId);
        localStorage.setItem(DESIGN_STUDIO_STORAGE_KEY, JSON.stringify(updatedConfig));
      } catch {
        // Ignore storage errors
      }
      applyDesignToDOM(themes[newThemeId], updatedConfig);
    },
    [designConfig, applyDesignToDOM]
  );

  // Update Design Studio Config (Font, Radius, Border, Shadow, Form Input, etc.)
  const updateDesignConfig = useCallback(
    (partial: Partial<DesignStudioConfig>) => {
      setDesignState((prev) => {
        const updated = { ...prev, ...partial };
        try {
          localStorage.setItem(DESIGN_STUDIO_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore storage errors
        }
        applyDesignToDOM(activeTheme, updated);
        return updated;
      });
    },
    [activeTheme, applyDesignToDOM]
  );

  // 1-Click Intelligent Font & Design Recommendation
  const applyRecommendedDesign = useCallback(() => {
    const recommended = getRecommendedDesignForTheme(themeId);
    setDesignState(recommended);
    try {
      localStorage.setItem(DESIGN_STUDIO_STORAGE_KEY, JSON.stringify(recommended));
    } catch {
      // Ignore storage errors
    }
    applyDesignToDOM(activeTheme, recommended);
  }, [themeId, activeTheme, applyDesignToDOM]);

  // Reset to Factory Defaults
  const resetToDefaults = useCallback(() => {
    const defaultConfig: DesignStudioConfig = {
      ...DEFAULT_DESIGN_CONFIG,
      themeId: 'warmIndustrial',
    };
    setThemeId('warmIndustrial');
    setDesignState(defaultConfig);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, 'warmIndustrial');
      localStorage.setItem(DESIGN_STUDIO_STORAGE_KEY, JSON.stringify(defaultConfig));
    } catch {
      // Ignore storage errors
    }
    applyDesignToDOM(themes['warmIndustrial'], defaultConfig);
  }, [applyDesignToDOM]);

  return (
    <ThemeContext.Provider
      value={{
        currentThemeId: themeId,
        currentTheme: activeTheme,
        setTheme: handleSetTheme,
        designConfig,
        updateDesignConfig,
        applyRecommendedDesign,
        resetToDefaults,
        availableThemes: availableThemesList,
        availableFonts: AVAILABLE_FONTS,
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
      designConfig: DEFAULT_DESIGN_CONFIG,
      updateDesignConfig: () => {},
      applyRecommendedDesign: () => {},
      resetToDefaults: () => {},
      availableThemes: availableThemesList,
      availableFonts: AVAILABLE_FONTS,
      isDark: false,
      mounted: false,
    };
  }
  return context;
}

export { themes, defaultThemeId, getTheme };
