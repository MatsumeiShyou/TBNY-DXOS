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
