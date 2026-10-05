import fs from 'fs';
import path from 'path';
import { getProjectRoot, normalizeRelativePath } from '../lib/paths.js';

async function main() {
  let input = '';
  for await (const chunk of process.stdin) { input += chunk; }

  try {
    const payload = JSON.parse(input);
    const targetFile = payload?.toolCall?.args?.TargetFile || payload?.args?.TargetFile;
    if (!targetFile) {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      return;
    }

    const root = getProjectRoot(payload);
    const relPath = normalizeRelativePath(targetFile, root);
    const relParts = relPath.split('/');

    // 1. Tier A: Protect Governance (AIからの変更を完全禁止)
    // ※ DEBT_AND_FUTURE.md は AI 自身が棚卸しできるよう保護から外した
    // ※ .githooks/ は事前フックの回避を防ぐために保護対象に含む
    const protectedPaths = ['.agents/', 'governance/', '.husky/', '.githooks/'];
    const isProtected = protectedPaths.some(p => relPath.startsWith(p)) || relPath === 'AGENTS.md';

    if (isProtected) {
      process.stdout.write(JSON.stringify({
        decision: 'deny',
        reason: '【AI統治機構の自己改ざん防止】 統治ディレクトリ・ファイルへのAIによる書き込みは物理的に禁止されています。変更が必要な場合は人間が直接編集してください。'
      }));
      return;
    }

    // 2. ルートディレクトリの純化（ホワイトリスト方式）
    if (relParts.length === 1 || (relParts.length > 1 && !['apps', 'db', 'docs', 'scripts', 'scratch', 'shared', 'supabase'].includes(relParts[0]))) {
      const allowlistPath = path.join(root, 'governance/root_allowlist.json');
      let allowedFiles = [];
      let allowedDirs = [];
      if (fs.existsSync(allowlistPath)) {
        const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
        allowedFiles = allowlist.allowed_root_files || [];
        allowedDirs = allowlist.allowed_root_directories || [];
      }

      const isAllowedFile = relParts.length === 1 && allowedFiles.includes(relParts[0]);
      const isAllowedDir = relParts.length > 1 && allowedDirs.includes(relParts[0]);

      if (!isAllowedFile && !isAllowedDir) {
        process.stdout.write(JSON.stringify({
          decision: 'deny',
          reason: '[ROOT_WHITELIST_VIOLATION] ルート直下または未許可ディレクトリへのファイル作成は許可されていません。対象: ' + relPath + '\n一時ファイルなら scratch/ に作成してください。恒久ファイルなら apps/ や db/ 等の適切な場所へ。\nシェル経由での作成や別名での作成による回避を禁じます。'
        }));
        return;
      }
    }

    // 3. package.json の dependencies / workspaces 禁止
    if (relPath === 'package.json') {
      const content = payload?.toolCall?.args?.CodeContent || payload?.args?.CodeContent || payload?.toolCall?.args?.ReplacementContent || payload?.args?.ReplacementContent;
      if (content && (content.includes('"dependencies"') || content.includes('"workspaces"'))) {
        process.stdout.write(JSON.stringify({
          decision: 'deny',
          reason: '【境界防衛型モノレポの掟】 ルートの package.json に dependencies や workspaces を追加することは禁止されています。'
        }));
        return;
      }
    }

    process.stdout.write(JSON.stringify({ decision: 'allow' }));

  } catch (err) {
    process.stdout.write(JSON.stringify({ 
      decision: 'deny', 
      reason: '[FAIL-CLOSED] 統治スクリプト (write-safety-check) 内で致命的なエラーが発生しました。エラー詳細: ' + err.message
    }));
  }
}

main();
