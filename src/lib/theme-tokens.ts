export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  palette: {
    primary: string;
    accent: string;
    bg: string;
    card: string;
    text: string;
  };
  crmVars: Record<string, string>;
  colors: {
    primary: {
      DEFAULT: string;
      hover: string;
      light: string;
      contrast: string;
    };
    accent: {
      DEFAULT: string;
      bg: string;
    };
    info: {
      DEFAULT: string;
      bg: string;
      text: string;
    };
    success: {
      DEFAULT: string;
      bg: string;
      text: string;
    };
    danger: {
      DEFAULT: string;
      bg: string;
      text: string;
    };
    purple: {
      DEFAULT: string;
      bg: string;
      text: string;
    };
    background: {
      app: string;
      surface: string;
      sidebar: string;
    };
    border: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
    };
  };
}

// 1. Warm Industrial (Default Uma Techno Fab)
export const warmIndustrial: ThemeDefinition = {
  id: 'warmIndustrial',
  name: 'Warm Industrial',
  description: 'Classic Uma Techno Fab Warm Terracotta & Amber',
  isDark: false,
  palette: {
    primary: '#75401F',
    accent: '#A96B34',
    bg: '#FBF8F3',
    card: '#FFFFFF',
    text: '#211B17',
  },
  crmVars: {
    '--crm-brand-50': '#F8F0E8',
    '--crm-brand-100': '#F0DFCE',
    '--crm-brand-200': '#DEC0A1',
    '--crm-brand-300': '#C99C70',
    '--crm-brand-400': '#B67F48',
    '--crm-brand-500': '#A96B34',
    '--crm-brand-600': '#8F5228',
    '--crm-brand-700': '#75401F',
    '--crm-brand-800': '#5F3218',
    '--crm-brand-900': '#442313',
    '--crm-bg-app': '#FBF8F3',
    '--crm-bg-sidebar': '#FAF7F2',
    '--crm-surface-card': '#FFFFFF',
    '--crm-surface-subtle': '#F5EFE7',
    '--crm-text-primary': '#211B17',
    '--crm-text-secondary': '#70665F',
    '--crm-text-tertiary': '#8D827A',
    '--crm-text-inverse': '#FFFFFF',
    '--crm-border-default': '#E7DED5',
    '--crm-border-strong': '#D5CAC0',
    '--crm-status-info': '#0E91B2',
    '--crm-status-info-soft': '#DDF5FA',
    '--crm-status-success': '#169B62',
    '--crm-status-success-soft': '#DFF6EA',
    '--crm-status-warning': '#D68A22',
    '--crm-status-warning-soft': '#FFF0D8',
    '--crm-status-danger': '#D94C64',
    '--crm-status-danger-soft': '#FDE5EA',
    '--crm-status-inspection': '#A43D8F',
    '--crm-status-inspection-soft': '#F6E2F2',
  },
  colors: {
    primary: {
      DEFAULT: '#75401F',
      hover: '#5F3218',
      light: '#F0DFCE',
      contrast: '#FFFFFF',
    },
    accent: {
      DEFAULT: '#A96B34',
      bg: '#F8F0E8',
    },
    info: {
      DEFAULT: '#0E91B2',
      bg: '#DDF5FA',
      text: '#0E91B2',
    },
    success: {
      DEFAULT: '#169B62',
      bg: '#DFF6EA',
      text: '#169B62',
    },
    danger: {
      DEFAULT: '#D94C64',
      bg: '#FDE5EA',
      text: '#D94C64',
    },
    purple: {
      DEFAULT: '#A43D8F',
      bg: '#F6E2F2',
      text: '#A43D8F',
    },
    background: {
      app: '#FBF8F3',
      surface: '#FFFFFF',
      sidebar: '#FAF7F2',
    },
    border: '#E7DED5',
    text: {
      primary: '#211B17',
      secondary: '#70665F',
      muted: '#8D827A',
      inverse: '#FFFFFF',
    },
  },
};

// 2. Corporate Royal Blue (Classic Enterprise SAP/Salesforce look)
export const corporateBlue: ThemeDefinition = {
  id: 'corporateBlue',
  name: 'Corporate Royal Blue',
  description: 'Enterprise Classic Precision Navy & Sapphire',
  isDark: false,
  palette: {
    primary: '#1D4ED8',
    accent: '#2563EB',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
  },
  crmVars: {
    '--crm-brand-50': '#EFF6FF',
    '--crm-brand-100': '#DBEAFE',
    '--crm-brand-200': '#BFDBFE',
    '--crm-brand-300': '#93C5FD',
    '--crm-brand-400': '#60A5FA',
    '--crm-brand-500': '#3B82F6',
    '--crm-brand-600': '#2563EB',
    '--crm-brand-700': '#1D4ED8',
    '--crm-brand-800': '#1E40AF',
    '--crm-brand-900': '#1E3A8A',
    '--crm-bg-app': '#F8FAFC',
    '--crm-bg-sidebar': '#F1F5F9',
    '--crm-surface-card': '#FFFFFF',
    '--crm-surface-subtle': '#F1F5F9',
    '--crm-text-primary': '#0F172A',
    '--crm-text-secondary': '#475569',
    '--crm-text-tertiary': '#94A3B8',
    '--crm-text-inverse': '#FFFFFF',
    '--crm-border-default': '#E2E8F0',
    '--crm-border-strong': '#CBD5E1',
    '--crm-status-info': '#0284C7',
    '--crm-status-info-soft': '#E0F2FE',
    '--crm-status-success': '#059669',
    '--crm-status-success-soft': '#D1FAE5',
    '--crm-status-warning': '#D97706',
    '--crm-status-warning-soft': '#FEF3C7',
    '--crm-status-danger': '#DC2626',
    '--crm-status-danger-soft': '#FEE2E2',
    '--crm-status-inspection': '#7C3AED',
    '--crm-status-inspection-soft': '#EDE9FE',
  },
  colors: {
    primary: {
      DEFAULT: '#1D4ED8',
      hover: '#1E40AF',
      light: '#DBEAFE',
      contrast: '#FFFFFF',
    },
    accent: {
      DEFAULT: '#3B82F6',
      bg: '#EFF6FF',
    },
    info: {
      DEFAULT: '#0284C7',
      bg: '#E0F2FE',
      text: '#0284C7',
    },
    success: {
      DEFAULT: '#059669',
      bg: '#D1FAE5',
      text: '#059669',
    },
    danger: {
      DEFAULT: '#DC2626',
      bg: '#FEE2E2',
      text: '#DC2626',
    },
    purple: {
      DEFAULT: '#7C3AED',
      bg: '#EDE9FE',
      text: '#7C3AED',
    },
    background: {
      app: '#F8FAFC',
      surface: '#FFFFFF',
      sidebar: '#F1F5F9',
    },
    border: '#E2E8F0',
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
    },
  },
};

// 3. Emerald Forest (Clean Green Operations & Eco Precision)
export const emeraldGreen: ThemeDefinition = {
  id: 'emeraldGreen',
  name: 'Emerald Precision',
  description: 'Fresh Operations Pine Green & Crisp Mint',
  isDark: false,
  palette: {
    primary: '#047857',
    accent: '#059669',
    bg: '#F6FBF8',
    card: '#FFFFFF',
    text: '#064E3B',
  },
  crmVars: {
    '--crm-brand-50': '#ECFDF5',
    '--crm-brand-100': '#D1FAE5',
    '--crm-brand-200': '#A7F3D0',
    '--crm-brand-300': '#6EE7B7',
    '--crm-brand-400': '#34D399',
    '--crm-brand-500': '#10B981',
    '--crm-brand-600': '#059669',
    '--crm-brand-700': '#047857',
    '--crm-brand-800': '#065F46',
    '--crm-brand-900': '#064E3B',
    '--crm-bg-app': '#F6FBF8',
    '--crm-bg-sidebar': '#F0FDF4',
    '--crm-surface-card': '#FFFFFF',
    '--crm-surface-subtle': '#E6F4EA',
    '--crm-text-primary': '#064E3B',
    '--crm-text-secondary': '#374151',
    '--crm-text-tertiary': '#6B7280',
    '--crm-text-inverse': '#FFFFFF',
    '--crm-border-default': '#D1E7DD',
    '--crm-border-strong': '#B7D9CA',
    '--crm-status-info': '#0284C7',
    '--crm-status-info-soft': '#E0F2FE',
    '--crm-status-success': '#059669',
    '--crm-status-success-soft': '#D1FAE5',
    '--crm-status-warning': '#D97706',
    '--crm-status-warning-soft': '#FEF3C7',
    '--crm-status-danger': '#DC2626',
    '--crm-status-danger-soft': '#FEE2E2',
    '--crm-status-inspection': '#0D9488',
    '--crm-status-inspection-soft': '#CCFBF1',
  },
  colors: {
    primary: {
      DEFAULT: '#047857',
      hover: '#065F46',
      light: '#D1FAE5',
      contrast: '#FFFFFF',
    },
    accent: {
      DEFAULT: '#10B981',
      bg: '#ECFDF5',
    },
    info: {
      DEFAULT: '#0284C7',
      bg: '#E0F2FE',
      text: '#0284C7',
    },
    success: {
      DEFAULT: '#059669',
      bg: '#D1FAE5',
      text: '#059669',
    },
    danger: {
      DEFAULT: '#DC2626',
      bg: '#FEE2E2',
      text: '#DC2626',
    },
    purple: {
      DEFAULT: '#0D9488',
      bg: '#CCFBF1',
      text: '#0D9488',
    },
    background: {
      app: '#F6FBF8',
      surface: '#FFFFFF',
      sidebar: '#F0FDF4',
    },
    border: '#D1E7DD',
    text: {
      primary: '#064E3B',
      secondary: '#374151',
      muted: '#6B7280',
      inverse: '#FFFFFF',
    },
  },
};

// 4. Executive Violet (Royal Purple & Indigo)
export const royalPurple: ThemeDefinition = {
  id: 'royalPurple',
  name: 'Executive Violet',
  description: 'Regal Luxury Indigo & Violet for Management',
  isDark: false,
  palette: {
    primary: '#6D28D9',
    accent: '#7C3AED',
    bg: '#FAF8FF',
    card: '#FFFFFF',
    text: '#1E1B4B',
  },
  crmVars: {
    '--crm-brand-50': '#FAF5FF',
    '--crm-brand-100': '#F3E8FF',
    '--crm-brand-200': '#E9D5FF',
    '--crm-brand-300': '#D8B4FE',
    '--crm-brand-400': '#C084FC',
    '--crm-brand-500': '#A855F7',
    '--crm-brand-600': '#7C3AED',
    '--crm-brand-700': '#6D28D9',
    '--crm-brand-800': '#5B21B6',
    '--crm-brand-900': '#3B0764',
    '--crm-bg-app': '#FAF8FF',
    '--crm-bg-sidebar': '#F5F3FF',
    '--crm-surface-card': '#FFFFFF',
    '--crm-surface-subtle': '#EDE9FE',
    '--crm-text-primary': '#1E1B4B',
    '--crm-text-secondary': '#4B5563',
    '--crm-text-tertiary': '#9CA3AF',
    '--crm-text-inverse': '#FFFFFF',
    '--crm-border-default': '#E4E0F5',
    '--crm-border-strong': '#D2CBE8',
    '--crm-status-info': '#0284C7',
    '--crm-status-info-soft': '#E0F2FE',
    '--crm-status-success': '#059669',
    '--crm-status-success-soft': '#D1FAE5',
    '--crm-status-warning': '#D97706',
    '--crm-status-warning-soft': '#FEF3C7',
    '--crm-status-danger': '#DC2626',
    '--crm-status-danger-soft': '#FEE2E2',
    '--crm-status-inspection': '#9333EA',
    '--crm-status-inspection-soft': '#F3E8FF',
  },
  colors: {
    primary: {
      DEFAULT: '#6D28D9',
      hover: '#5B21B6',
      light: '#F3E8FF',
      contrast: '#FFFFFF',
    },
    accent: {
      DEFAULT: '#A855F7',
      bg: '#FAF5FF',
    },
    info: {
      DEFAULT: '#0284C7',
      bg: '#E0F2FE',
      text: '#0284C7',
    },
    success: {
      DEFAULT: '#059669',
      bg: '#D1FAE5',
      text: '#059669',
    },
    danger: {
      DEFAULT: '#DC2626',
      bg: '#FEE2E2',
      text: '#DC2626',
    },
    purple: {
      DEFAULT: '#9333EA',
      bg: '#F3E8FF',
      text: '#9333EA',
    },
    background: {
      app: '#FAF8FF',
      surface: '#FFFFFF',
      sidebar: '#F5F3FF',
    },
    border: '#E4E0F5',
    text: {
      primary: '#1E1B4B',
      secondary: '#4B5563',
      muted: '#9CA3AF',
      inverse: '#FFFFFF',
    },
  },
};

// 5. Crimson Forge (Dynamic Industrial Red & Steel)
export const crimsonSteel: ThemeDefinition = {
  id: 'crimsonSteel',
  name: 'Crimson Forge',
  description: 'High-Energy Industrial Ruby & Graphite',
  isDark: false,
  palette: {
    primary: '#B91C1C',
    accent: '#DC2626',
    bg: '#FCF8F8',
    card: '#FFFFFF',
    text: '#1C1917',
  },
  crmVars: {
    '--crm-brand-50': '#FEF2F2',
    '--crm-brand-100': '#FEE2E2',
    '--crm-brand-200': '#FECACA',
    '--crm-brand-300': '#FCA5A5',
    '--crm-brand-400': '#F87171',
    '--crm-brand-500': '#EF4444',
    '--crm-brand-600': '#DC2626',
    '--crm-brand-700': '#B91C1C',
    '--crm-brand-800': '#991B1B',
    '--crm-brand-900': '#7F1D1D',
    '--crm-bg-app': '#FCF8F8',
    '--crm-bg-sidebar': '#FFF5F5',
    '--crm-surface-card': '#FFFFFF',
    '--crm-surface-subtle': '#FCE7E7',
    '--crm-text-primary': '#1C1917',
    '--crm-text-secondary': '#57534E',
    '--crm-text-tertiary': '#78716C',
    '--crm-text-inverse': '#FFFFFF',
    '--crm-border-default': '#F4D8D8',
    '--crm-border-strong': '#E8BEBE',
    '--crm-status-info': '#0284C7',
    '--crm-status-info-soft': '#E0F2FE',
    '--crm-status-success': '#059669',
    '--crm-status-success-soft': '#D1FAE5',
    '--crm-status-warning': '#D97706',
    '--crm-status-warning-soft': '#FEF3C7',
    '--crm-status-danger': '#B91C1C',
    '--crm-status-danger-soft': '#FEE2E2',
    '--crm-status-inspection': '#991B1B',
    '--crm-status-inspection-soft': '#FEE2E2',
  },
  colors: {
    primary: {
      DEFAULT: '#B91C1C',
      hover: '#991B1B',
      light: '#FEE2E2',
      contrast: '#FFFFFF',
    },
    accent: {
      DEFAULT: '#EF4444',
      bg: '#FEF2F2',
    },
    info: {
      DEFAULT: '#0284C7',
      bg: '#E0F2FE',
      text: '#0284C7',
    },
    success: {
      DEFAULT: '#059669',
      bg: '#D1FAE5',
      text: '#059669',
    },
    danger: {
      DEFAULT: '#B91C1C',
      bg: '#FEE2E2',
      text: '#B91C1C',
    },
    purple: {
      DEFAULT: '#991B1B',
      bg: '#FEE2E2',
      text: '#991B1B',
    },
    background: {
      app: '#FCF8F8',
      surface: '#FFFFFF',
      sidebar: '#FFF5F5',
    },
    border: '#F4D8D8',
    text: {
      primary: '#1C1917',
      secondary: '#57534E',
      muted: '#78716C',
      inverse: '#FFFFFF',
    },
  },
};

// 6. Obsidian Dark (Full Dark Mode for Night Operations & OLED)
export const obsidianDark: ThemeDefinition = {
  id: 'obsidianDark',
  name: 'Obsidian Night',
  description: 'Deep Charcoal Night Mode with Neon Accents',
  isDark: true,
  palette: {
    primary: '#0284C7',
    accent: '#38BDF8',
    bg: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
  },
  crmVars: {
    '--crm-brand-50': '#1E293B',
    '--crm-brand-100': '#334155',
    '--crm-brand-200': '#475569',
    '--crm-brand-300': '#64748B',
    '--crm-brand-400': '#38BDF8',
    '--crm-brand-500': '#0EA5E9',
    '--crm-brand-600': '#0284C7',
    '--crm-brand-700': '#0369A1',
    '--crm-brand-800': '#075985',
    '--crm-brand-900': '#0C4A6E',
    '--crm-bg-app': '#0B0F19',
    '--crm-bg-sidebar': '#111827',
    '--crm-surface-card': '#1E293B',
    '--crm-surface-subtle': '#182234',
    '--crm-text-primary': '#F8FAFC',
    '--crm-text-secondary': '#CBD5E1',
    '--crm-text-tertiary': '#94A3B8',
    '--crm-text-inverse': '#0F172A',
    '--crm-border-default': '#334155',
    '--crm-border-strong': '#475569',
    '--crm-status-info': '#38BDF8',
    '--crm-status-info-soft': '#0C4A6E',
    '--crm-status-success': '#34D399',
    '--crm-status-success-soft': '#064E3B',
    '--crm-status-warning': '#FBBF24',
    '--crm-status-warning-soft': '#78350F',
    '--crm-status-danger': '#F87171',
    '--crm-status-danger-soft': '#7F1D1D',
    '--crm-status-inspection': '#C084FC',
    '--crm-status-inspection-soft': '#581C87',
  },
  colors: {
    primary: {
      DEFAULT: '#0284C7',
      hover: '#0369A1',
      light: '#1E293B',
      contrast: '#FFFFFF',
    },
    accent: {
      DEFAULT: '#38BDF8',
      bg: '#0F172A',
    },
    info: {
      DEFAULT: '#38BDF8',
      bg: '#0C4A6E',
      text: '#38BDF8',
    },
    success: {
      DEFAULT: '#34D399',
      bg: '#064E3B',
      text: '#34D399',
    },
    danger: {
      DEFAULT: '#F87171',
      bg: '#7F1D1D',
      text: '#F87171',
    },
    purple: {
      DEFAULT: '#C084FC',
      bg: '#581C87',
      text: '#C084FC',
    },
    background: {
      app: '#0B0F19',
      surface: '#1E293B',
      sidebar: '#111827',
    },
    border: '#334155',
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
      inverse: '#0F172A',
    },
  },
};

// 7. Titanium Graphite (High Precision Nordic Slate & Cyan)
export const titaniumGraphite: ThemeDefinition = {
  id: 'titaniumGraphite',
  name: 'Titanium Graphite',
  description: 'Nordic Slate & Precision Cyan for Engineers',
  isDark: false,
  palette: {
    primary: '#0F766E',
    accent: '#14B8A6',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
  },
  crmVars: {
    '--crm-brand-50': '#F0FDFA',
    '--crm-brand-100': '#CCFBF1',
    '--crm-brand-200': '#99F6E4',
    '--crm-brand-300': '#5EEAD4',
    '--crm-brand-400': '#2DD4BF',
    '--crm-brand-500': '#14B8A6',
    '--crm-brand-600': '#0D9488',
    '--crm-brand-700': '#0F766E',
    '--crm-brand-800': '#115E59',
    '--crm-brand-900': '#134E4A',
    '--crm-bg-app': '#F8FAFC',
    '--crm-bg-sidebar': '#F1F5F9',
    '--crm-surface-card': '#FFFFFF',
    '--crm-surface-subtle': '#E2E8F0',
    '--crm-text-primary': '#0F172A',
    '--crm-text-secondary': '#475569',
    '--crm-text-tertiary': '#94A3B8',
    '--crm-text-inverse': '#FFFFFF',
    '--crm-border-default': '#CBD5E1',
    '--crm-border-strong': '#94A3B8',
    '--crm-status-info': '#0284C7',
    '--crm-status-info-soft': '#E0F2FE',
    '--crm-status-success': '#059669',
    '--crm-status-success-soft': '#D1FAE5',
    '--crm-status-warning': '#D97706',
    '--crm-status-warning-soft': '#FEF3C7',
    '--crm-status-danger': '#DC2626',
    '--crm-status-danger-soft': '#FEE2E2',
    '--crm-status-inspection': '#0F766E',
    '--crm-status-inspection-soft': '#CCFBF1',
  },
  colors: {
    primary: {
      DEFAULT: '#0F766E',
      hover: '#115E59',
      light: '#CCFBF1',
      contrast: '#FFFFFF',
    },
    accent: {
      DEFAULT: '#14B8A6',
      bg: '#F0FDFA',
    },
    info: {
      DEFAULT: '#0284C7',
      bg: '#E0F2FE',
      text: '#0284C7',
    },
    success: {
      DEFAULT: '#059669',
      bg: '#D1FAE5',
      text: '#059669',
    },
    danger: {
      DEFAULT: '#DC2626',
      bg: '#FEE2E2',
      text: '#DC2626',
    },
    purple: {
      DEFAULT: '#0F766E',
      bg: '#CCFBF1',
      text: '#0F766E',
    },
    background: {
      app: '#F8FAFC',
      surface: '#FFFFFF',
      sidebar: '#F1F5F9',
    },
    border: '#CBD5E1',
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
    },
  },
};

// Aliases for full backwards compatibility
export const umaTechnoFab = warmIndustrial;
export type ThemeTokens = typeof warmIndustrial;

export const themes: Record<string, ThemeDefinition> = {
  warmIndustrial,
  umaTechnoFab,
  corporateBlue,
  emeraldGreen,
  royalPurple,
  crimsonSteel,
  obsidianDark,
  titaniumGraphite,
};

export const availableThemesList: ThemeDefinition[] = [
  warmIndustrial,
  corporateBlue,
  emeraldGreen,
  royalPurple,
  crimsonSteel,
  obsidianDark,
  titaniumGraphite,
];

export const defaultThemeId = 'warmIndustrial';

export function getTheme(themeId?: string | null): ThemeDefinition {
  if (!themeId) return warmIndustrial;
  return themes[themeId] || warmIndustrial;
}

export const crmTheme = {
  meta: {
    name: "Warm Industrial CRM",
    source: "Visual estimate from supplied compressed dashboard screenshot",
  },
  colors: warmIndustrial.crmVars,
  semantic: warmIndustrial.colors,
  typography: {
    fontFamily: {
      sans: '"Manrope", "Inter", "Segoe UI", sans-serif',
    },
    fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  },
  spacing: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 },
  radii: { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 },
} as const;

export type CrmTheme = typeof crmTheme;

// =========================================================================
// UMA ERP DESIGN STUDIO DEFINITIONS & FONT HARMONY RECOMMENDATION ENGINE
// =========================================================================

export interface FontOption {
  id: string;
  name: string;
  category: string;
  fontFamily: string;
  description: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  {
    id: 'Outfit',
    name: 'Outfit',
    category: 'Modern Luxury',
    fontFamily: "'Outfit', sans-serif",
    description: 'Crisp geometric typography with bold executive prestige',
  },
  {
    id: 'Plus Jakarta Sans',
    name: 'Plus Jakarta Sans',
    category: 'Corporate Geometric',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    description: 'Superior legibility for high-density tables and invoices',
  },
  {
    id: 'Space Grotesk',
    name: 'Space Grotesk',
    category: 'Industrial Tech',
    fontFamily: "'Space Grotesk', sans-serif",
    description: 'Precision engineering aesthetic with distinct technical cuts',
  },
  {
    id: 'DM Sans',
    name: 'DM Sans',
    category: 'Soft Contemporary',
    fontFamily: "'DM Sans', sans-serif",
    description: 'Modern, balanced and visually effortless for shop-floor work',
  },
  {
    id: 'Inter',
    name: 'Inter',
    category: 'Clean Precision',
    fontFamily: "'Inter', sans-serif",
    description: 'The global benchmark for data-rich enterprise software UI',
  },
  {
    id: 'Manrope',
    name: 'Manrope',
    category: 'Executive Balance',
    fontFamily: "'Manrope', sans-serif",
    description: 'Modern open-source grotesque with ultra-clean rounded terminals',
  },
  {
    id: 'JetBrains Mono',
    name: 'JetBrains Mono',
    category: 'Precision Technical',
    fontFamily: "'JetBrains Mono', monospace",
    description: 'High-density engineering monospace for blueprints, BOMs, and serials',
  },
];

export type CardRadiusOption = 'sharp' | 'rounded' | 'smooth' | 'pill';
export type CardBorderWidthOption = '0' | '1' | '2' | '3';
export type CardShadowOption = 'flat' | 'soft' | 'depth' | 'glow';
export type CardSurfaceOption = 'solid' | 'subtle' | 'glass';
export type InputStyleOption = 'box' | 'rounded' | 'pill' | 'underline';
export type ButtonVariantOption = 'solid' | 'gradient' | 'soft' | 'glass';

export interface DesignStudioConfig {
  themeId: string;
  fontFamily: string;
  headingColor: string;
  textColor: string;
  cardRadius: CardRadiusOption;
  cardBorderWidth: CardBorderWidthOption;
  cardShadow: CardShadowOption;
  cardSurface: CardSurfaceOption;
  inputStyle: InputStyleOption;
  buttonVariant: ButtonVariantOption;
  customCardBg?: string;
  customCardBorder?: string;
  headerGradient?: boolean;
}

export const DEFAULT_DESIGN_CONFIG: DesignStudioConfig = {
  themeId: 'warmIndustrial',
  fontFamily: 'Outfit',
  headingColor: '',
  textColor: '',
  cardRadius: 'smooth',
  cardBorderWidth: '1',
  cardShadow: 'soft',
  cardSurface: 'solid',
  inputStyle: 'rounded',
  buttonVariant: 'gradient',
  customCardBg: '',
  customCardBorder: '',
  headerGradient: false,
};

export interface DesignPreset {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  config: Partial<DesignStudioConfig>;
}

export const SIGNATURE_DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'luxury-industrial',
    name: 'Luxury Industrial',
    subtitle: 'Warm Terracotta, Smooth 18px Cards, Deep Soft Shadows',
    badge: 'UMA Default',
    config: {
      themeId: 'warmIndustrial',
      fontFamily: 'Outfit',
      headingColor: '#3E2723',
      textColor: '#211B17',
      cardRadius: 'smooth',
      cardBorderWidth: '1',
      cardShadow: 'soft',
      cardSurface: 'solid',
      inputStyle: 'rounded',
      buttonVariant: 'gradient',
      customCardBg: '#FFFFFF',
      customCardBorder: '#E7DED5',
      headerGradient: true,
    },
  },
  {
    id: 'cyber-glassmorphic',
    name: 'Cyber Glassmorphic',
    subtitle: 'Frosted Translucent Blur, Neon Accents, Pill 26px Cards',
    badge: 'Futuristic',
    config: {
      themeId: 'obsidianDark',
      fontFamily: 'Space Grotesk',
      headingColor: '#38BDF8',
      textColor: '#E2E8F0',
      cardRadius: 'pill',
      cardBorderWidth: '1',
      cardShadow: 'glow',
      cardSurface: 'glass',
      inputStyle: 'pill',
      buttonVariant: 'glass',
      customCardBg: 'rgba(15, 23, 42, 0.85)',
      customCardBorder: '#38BDF8',
      headerGradient: true,
    },
  },
  {
    id: 'engineering-blueprint',
    name: 'Precision Engineering',
    subtitle: 'JetBrains Mono, Sharp 0px Cards, Crisp 2px Borders',
    badge: 'Technical',
    config: {
      themeId: 'titaniumGraphite',
      fontFamily: 'JetBrains Mono',
      headingColor: '#0F172A',
      textColor: '#334155',
      cardRadius: 'sharp',
      cardBorderWidth: '2',
      cardShadow: 'flat',
      cardSurface: 'solid',
      inputStyle: 'box',
      buttonVariant: 'solid',
      customCardBg: '#FFFFFF',
      customCardBorder: '#475569',
      headerGradient: false,
    },
  },
  {
    id: 'executive-minimalist',
    name: 'Executive Minimalist',
    subtitle: 'Plus Jakarta Sans, Borderless 0px, Soft Floats & Underlines',
    badge: 'Modern Clean',
    config: {
      themeId: 'corporateBlue',
      fontFamily: 'Plus Jakarta Sans',
      headingColor: '#0F172A',
      textColor: '#334155',
      cardRadius: 'rounded',
      cardBorderWidth: '0',
      cardShadow: 'depth',
      cardSurface: 'solid',
      inputStyle: 'underline',
      buttonVariant: 'gradient',
      customCardBg: '#FFFFFF',
      customCardBorder: '#E2E8F0',
      headerGradient: false,
    },
  },
];

/**
 * Intelligent Theme-Font Recommendation Engine
 * Analyzes the selected color theme and suggests the most harmonious
 * font pairing, contrast colors, card radiuses, and shadow styles.
 */
export function getRecommendedDesignForTheme(themeId: string): DesignStudioConfig {
  switch (themeId) {
    case 'obsidianDark':
      return {
        themeId: 'obsidianDark',
        fontFamily: 'Space Grotesk',
        headingColor: '#F8FAFC',
        textColor: '#CBD5E1',
        cardRadius: 'smooth',
        cardBorderWidth: '1',
        cardShadow: 'glow',
        cardSurface: 'solid',
        inputStyle: 'rounded',
        buttonVariant: 'gradient',
      };
    case 'royalPurple':
      return {
        themeId: 'royalPurple',
        fontFamily: 'DM Sans',
        headingColor: '#3B0764',
        textColor: '#1E1B4B',
        cardRadius: 'pill',
        cardBorderWidth: '1',
        cardShadow: 'soft',
        cardSurface: 'glass',
        inputStyle: 'pill',
        buttonVariant: 'gradient',
      };
    case 'emeraldGreen':
      return {
        themeId: 'emeraldGreen',
        fontFamily: 'Plus Jakarta Sans',
        headingColor: '#064E3B',
        textColor: '#0F172A',
        cardRadius: 'rounded',
        cardBorderWidth: '1',
        cardShadow: 'soft',
        cardSurface: 'solid',
        inputStyle: 'rounded',
        buttonVariant: 'solid',
      };
    case 'corporateBlue':
      return {
        themeId: 'corporateBlue',
        fontFamily: 'Plus Jakarta Sans',
        headingColor: '#0C4A6E',
        textColor: '#0F172A',
        cardRadius: 'rounded',
        cardBorderWidth: '1',
        cardShadow: 'depth',
        cardSurface: 'solid',
        inputStyle: 'rounded',
        buttonVariant: 'solid',
      };
    case 'titaniumGraphite':
      return {
        themeId: 'titaniumGraphite',
        fontFamily: 'Inter',
        headingColor: '#0F172A',
        textColor: '#334155',
        cardRadius: 'sharp',
        cardBorderWidth: '2',
        cardShadow: 'flat',
        cardSurface: 'solid',
        inputStyle: 'box',
        buttonVariant: 'solid',
      };
    case 'crimsonSteel':
      return {
        themeId: 'crimsonSteel',
        fontFamily: 'Space Grotesk',
        headingColor: '#881337',
        textColor: '#1C1917',
        cardRadius: 'sharp',
        cardBorderWidth: '2',
        cardShadow: 'depth',
        cardSurface: 'solid',
        inputStyle: 'box',
        buttonVariant: 'gradient',
      };
    default:
      return {
        themeId: 'warmIndustrial',
        fontFamily: 'Outfit',
        headingColor: '#211B17',
        textColor: '#211B17',
        cardRadius: 'smooth',
        cardBorderWidth: '1',
        cardShadow: 'soft',
        cardSurface: 'solid',
        inputStyle: 'rounded',
        buttonVariant: 'gradient',
      };
  }
}

