import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const sharedDir = path.join(rootDir, 'db', 'shared');
const appsDir = path.join(rootDir, 'apps');

if (!fs.existsSync(sharedDir)) {
  console.log('ℹ️ db/shared ディレクトリが存在しません。同期をスキップします。');
  process.exit(0);
}

const sharedFiles = fs.readdirSync(sharedDir).filter(f => f.endsWith('.ts') || f.endsWith('.json'));
if (sharedFiles.length === 0) {
  console.log('ℹ️ 共有ファイルがありません。');
  process.exit(0);
}

let syncCount = 0;

if (fs.existsSync(appsDir)) {
  const apps = fs.readdirSync(appsDir);
  for (const app of apps) {
    const appRoot = path.join(appsDir, app);
    if (!fs.existsSync(path.join(appRoot, 'package.json'))) continue;

    const targetDir = path.join(appRoot, 'src', 'types', 'generated');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    for (const file of sharedFiles) {
      const srcFile = path.join(sharedDir, file);
      const destFile = path.join(targetDir, file);
      const content = fs.readFileSync(srcFile, 'utf8');
      
      // Auto-generated marker to prevent manual edits
      const header = `// [自動生成] このファイルは db/shared/${file} から同期されました。\n// 絶対に直接編集しないでください。\n\n`;
      fs.writeFileSync(destFile, header + content, 'utf8');
      syncCount++;
    }
  }
}

console.log(`✅ [同期完了] ${syncCount} 件のファイルを各アプリへ配布しました。`);
