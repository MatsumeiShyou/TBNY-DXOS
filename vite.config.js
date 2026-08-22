import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// カスタム保存APIプラグイン
function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // マスタデータ保存
        if (req.url === '/api/save-master' && req.method === 'POST') {
          handlePost(req, res, path.resolve(__dirname, 'public/data/master.json'));
        } 
        // 日次スケジュール保存
        else if (req.url === '/api/save-daily' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const { date, state } = JSON.parse(body);
              if (!date || !state) throw new Error('Invalid payload');
              
              const dirPath = path.resolve(__dirname, 'public/data/daily');
              if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
              
              const savePath = path.join(dirPath, `${date}.json`);
              fs.writeFileSync(savePath, JSON.stringify(state, null, 2), 'utf8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              console.error('Failed to save daily state:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: error.message }));
            }
          });
        }
        // 例外データ保存
        else if (req.url === '/api/save-exceptions' && req.method === 'POST') {
          handlePost(req, res, path.resolve(__dirname, 'public/data/exceptions.json'));
        }
        // テンプレートデータ保存
        else if (req.url === '/api/save-templates' && req.method === 'POST') {
          handlePost(req, res, path.resolve(__dirname, 'public/data/templates.json'));
        }
        else {
          next();
        }
      });
    }
  };
}

function handlePost(req, res, savePath) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const dirPath = path.dirname(savePath);
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(savePath, JSON.stringify(data, null, 2), 'utf8');
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      console.error(`Failed to save ${path.basename(savePath)}:`, error);
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin()],
  server: {
    watch: {
      // JSONの更新による自動リロードを防ぐ
      ignored: ['**/public/data/**/*.json']
    }
  }
})
