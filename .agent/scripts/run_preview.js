import { spawnSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const sessionDir = join(process.cwd(), '.agent', 'session');
if (!existsSync(sessionDir)) mkdirSync(sessionDir, { recursive: true });

// Preview実行の物理証跡を記録
writeFileSync(join(sessionDir, 'preview.log'), new Date().toISOString(), 'utf-8');
console.log('✅ [CAVR] Preview実行の物理証跡を記録しました。');

// Viteプレビューを起動
spawnSync('npx', ['vite', 'preview'], { stdio: 'inherit', shell: true });
