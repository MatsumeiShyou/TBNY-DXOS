import type { Config } from 'tailwindcss';

const config: Config = {
  prefix: 'tw-',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Driver App Prototype Theme
        primary: '#0f4c81',
        secondary: '#f5f5f5',
        accent: '#d97706',
        success: '#10b981',
        danger: '#ef4444',

        // Weighing Admin App Theme
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        background: {
          primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          disabled: 'rgb(var(--color-text-disabled) / <alpha-value>)',
        },
        border: {
          default: 'rgb(var(--color-border-default) / <alpha-value>)',
          focus: 'rgb(var(--color-border-focus) / <alpha-value>)',
        },
        interactive: {
          default: 'rgb(var(--color-interactive-default) / <alpha-value>)',
          hover: 'rgb(var(--color-interactive-hover) / <alpha-value>)',
          active: 'rgb(var(--color-interactive-active) / <alpha-value>)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
  // 既存の Vanilla CSS への影響を最小限にするための設定
  corePlugins: {
    preflight: false, // 既存のベーススタイルをリセットさせない
  },
};

export default config;
