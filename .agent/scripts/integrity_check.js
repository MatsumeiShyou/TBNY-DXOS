/**
 * Integrity Check Script
 * 
 * 統治憲法 v8.0 に基づき、プロジェクト内の不純物を検知する。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');

const FORBIDDEN_PATTERNS = [
  { pattern: /\.\.\/RePaper Route/g, label: 'EXTERNAL_PATH_DEPENDENCY', message: 'リポジトリ外への相対パス参照が検出されました。' },
  { pattern: /Sentinel Governance v7\.1/gi, label: 'OUTDATED_GOVERNANCE_VERSION', message: '旧バージョンの統治憲法への参照が残っています。' },
  { pattern: /外部アプリケーションとして稼働中です/g, label: 'PLACEHOLDER_DEBT', message: '未統合のプレースホルダーが残存しています。' }
];

const IGNORE_DIRS = ['.git', 'node_modules', 'dist', '.agent', 'governance/history'];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  let issues = 0;

  for (const file of files) {
    if (IGNORE_DIRS.includes(file)) continue;
    const fullPath = path.join(dir, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      issues += scanDir(fullPath);
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      FORBIDDEN_PATTERNS.forEach(({ pattern, label, message }) => {
        if (pattern.test(content)) {
          console.error(`[\x1b[31m${label}\x1b[0m] ${fullPath}`);
          console.error(`   -> ${message}`);
          issues++;
        }
      });
    }
  }
  return issues;
}

console.log('🔍 [Integrity Check] 物理整合性のスキャンを開始します...');
const totalIssues = scanDir(ROOT);

if (totalIssues > 0) {
  console.error(`\n❌ 合計 ${totalIssues} 件の整合性エラーが検出されました。`);
  process.exit(1);
} else {
  console.log('\n✅ 整合性チェックを通過しました。');
  process.exit(0);
}
