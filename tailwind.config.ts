import type { Config } from 'tailwindcss';

const config: Config = {
  prefix: 'tw-',
  darkMode: ['selector', '[data-theme="dark"]'],
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
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        background: {
          primary: 'var(--color-background-base)',
          secondary: 'var(--color-background-alt)',
          tertiary: 'var(--color-background-alt)', // fallback
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          disabled: 'var(--color-text-secondary)', // fallback
        },
        border: {
          default: 'var(--color-border-subtle)',
          focus: 'var(--color-border-interactive)',
        },
        interactive: {
          default: 'var(--color-interactive-primary)',
          hover: 'var(--color-interactive-primary)', // Simplification for now
          active: 'var(--color-interactive-primary)',
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
