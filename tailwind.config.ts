import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        crm: {
          brand: {
            50: "var(--crm-brand-50)",
            100: "var(--crm-brand-100)",
            200: "var(--crm-brand-200)",
            300: "var(--crm-brand-300)",
            400: "var(--crm-brand-400)",
            500: "var(--crm-brand-500)",
            600: "var(--crm-brand-600)",
            700: "var(--crm-brand-700)",
            800: "var(--crm-brand-800)",
            900: "var(--crm-brand-900)",
          },
          bg: {
            app: "var(--crm-bg-app)",
            sidebar: "var(--crm-bg-sidebar)",
          },
          surface: {
            card: "var(--crm-surface-card)",
            subtle: "var(--crm-surface-subtle)",
          },
          text: {
            primary: "var(--crm-text-primary)",
            secondary: "var(--crm-text-secondary)",
            tertiary: "var(--crm-text-tertiary)",
            inverse: "var(--crm-text-inverse)",
          },
          border: {
            default: "var(--crm-border-default)",
            strong: "var(--crm-border-strong)",
          },
          status: {
            info: "var(--crm-status-info)",
            "info-soft": "var(--crm-status-info-soft)",
            success: "var(--crm-status-success)",
            "success-soft": "var(--crm-status-success-soft)",
            warning: "var(--crm-status-warning)",
            "warning-soft": "var(--crm-status-warning-soft)",
            danger: "var(--crm-status-danger)",
            "danger-soft": "var(--crm-status-danger-soft)",
            inspection: "var(--crm-status-inspection)",
            "inspection-soft": "var(--crm-status-inspection-soft)",
          },
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          light: "var(--color-primary-light)",
          contrast: "var(--color-primary-contrast)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          bg: "var(--color-accent-bg)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          bg: "var(--color-info-bg)",
          text: "var(--color-info-text)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          bg: "var(--color-success-bg)",
          text: "var(--color-success-text)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          bg: "var(--color-danger-bg)",
          text: "var(--color-danger-text)",
        },
        purple: {
          DEFAULT: "var(--color-purple)",
          bg: "var(--color-purple-bg)",
          text: "var(--color-purple-text)",
        },
        pink: {
          50: "#EFF4FF", 100: "#DBE6FE", 200: "#BFD2FE", 300: "#93B4FD", 400: "#608CFA",
          500: "#3B68F0", 600: "#2A4FD6", 700: "#1F3FB0", 800: "#1B3489", 900: "#172B6B", 950: "#10204F",
        },
        orange: {
          50: "#EFF4FF", 100: "#DBE6FE", 200: "#BFD2FE", 300: "#93B4FD", 400: "#608CFA",
          500: "#3B68F0", 600: "#2A4FD6", 700: "#1F3FB0", 800: "#1B3489", 900: "#172B6B", 950: "#10204F",
        },
        indigo: {
          50: "#EFF4FF", 100: "#DBE6FE", 200: "#BFD2FE", 300: "#93B4FD", 400: "#608CFA",
          500: "#3B68F0", 600: "#2A4FD6", 700: "#1F3FB0", 800: "#1B3489", 900: "#172B6B", 950: "#10204F",
        },
        violet: {
          50: "#EFF4FF", 100: "#DBE6FE", 200: "#BFD2FE", 300: "#93B4FD", 400: "#608CFA",
          500: "#3B68F0", 600: "#2A4FD6", 700: "#1F3FB0", 800: "#1B3489", 900: "#172B6B", 950: "#10204F",
        },
        fuchsia: {
          50: "#EFF4FF", 100: "#DBE6FE", 200: "#BFD2FE", 300: "#93B4FD", 400: "#608CFA",
          500: "#3B68F0", 600: "#2A4FD6", 700: "#1F3FB0", 800: "#1B3489", 900: "#172B6B", 950: "#10204F",
        },
        teal: {
          50: "#EFF4FF", 100: "#DBE6FE", 200: "#BFD2FE", 300: "#93B4FD", 400: "#608CFA",
          500: "#3B68F0", 600: "#2A4FD6", 700: "#1F3FB0", 800: "#1B3489", 900: "#172B6B", 950: "#10204F",
        },
        cyan: {
          50: "#EFF4FF", 100: "#DBE6FE", 200: "#BFD2FE", 300: "#93B4FD", 400: "#608CFA",
          500: "#3B68F0", 600: "#2A4FD6", 700: "#1F3FB0", 800: "#1B3489", 900: "#172B6B", 950: "#10204F",
        },
        sky: {
          50: "#EFF4FF", 100: "#DBE6FE", 200: "#BFD2FE", 300: "#93B4FD", 400: "#608CFA",
          500: "#3B68F0", 600: "#2A4FD6", 700: "#1F3FB0", 800: "#1B3489", 900: "#172B6B", 950: "#10204F",
        },
        blue: {
          50: "#EFF4FF", 100: "#DBE6FE", 200: "#BFD2FE", 300: "#93B4FD", 400: "#608CFA",
          500: "#3B68F0", 600: "#2A4FD6", 700: "#1F3FB0", 800: "#1B3489", 900: "#172B6B", 950: "#10204F",
        },
        border: "var(--color-border)",
        "bg-app": "var(--color-bg-app)",
        "bg-surface": "var(--color-bg-surface)",
        "bg-sidebar": "var(--color-bg-sidebar)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
      },
      borderRadius: {
        crmSm: "var(--crm-radius-sm)",
        crmMd: "var(--crm-radius-md)",
        crmLg: "var(--crm-radius-lg)",
        crmXl: "var(--crm-radius-xl)",
        crmPill: "var(--crm-radius-pill)",
      },
      boxShadow: {
        crmSubtle: "var(--crm-shadow-subtle)",
        crmCard: "var(--crm-shadow-card)",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      backgroundImage: {
        "progress-gradient": "var(--gradient-progress)",
      },
    },
  },
  plugins: [],
};

export default config;
