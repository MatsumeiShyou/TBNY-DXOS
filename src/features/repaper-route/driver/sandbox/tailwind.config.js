
/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'tw-',
  content: [
    "./src/features/repaper-route/driver/sandbox/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // 基盤 OS との衝突を避けるため
  }
}
