import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// [Layer 3 Firewall] Rollup Audit Plugin
const boundaryEnforcementPlugin = () => {
  return {
    name: 'boundary-enforcement',
    enforce: 'post',
    generateBundle(options, bundle) {
      const appRoot = process.cwd();
      const gitRoot = path.resolve(appRoot, '../../');

      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk') {
          const moduleIds = Object.keys(chunk.modules);
          for (const id of moduleIds) {
            // Ignore virtual modules and node_modules
            if (id.includes('\x00') || id.includes('node_modules')) continue;

            const normalizedId = id.split(path.sep).join('/');
            const normalizedAppRoot = appRoot.split(path.sep).join('/');

            if (!normalizedId.startsWith(normalizedAppRoot)) {
              this.error(`【境界防衛型モノレポの掟】ビルド監査エラー: アプリ外のファイルがインポートされました (${id})`);
            }
          }
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), boundaryEnforcementPlugin()],
  server: {
    // 開発サーバー時の越境参照もブロック
    fs: {
      strict: true,
      allow: [process.cwd()]
    },
    port: 5173,
    strictPort: true
  }
})
