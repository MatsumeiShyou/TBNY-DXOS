import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\x1b[36m%s\x1b[0m', '🚀 [TBNY DXOS] 統合起動シーケンスを開始します...');

// TBNY DXOS (OS本体) の起動 (ポート 5173)
const osProcess = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// RePaper Route の起動 (ポート 5174)
const appPath = path.resolve(__dirname, '../RePaper Route/apps/repaper-route');
const appProcess = spawn('npm', ['run', 'dev'], {
  cwd: appPath,
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\x1b[31m%s\x1b[0m', '\n🛑 サーバーを終了します...');
  osProcess.kill('SIGINT');
  appProcess.kill('SIGINT');
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
