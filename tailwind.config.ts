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
        // 必要に応じて DXOS のデザイントークンと同期可能
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
