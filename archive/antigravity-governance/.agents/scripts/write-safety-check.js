import fs from 'fs';
import path from 'path';

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

    const normalizedPath = targetFile.replace(/\\/g, '/');

    // 1. Tier A: Protect Governance
    if (normalizedPath.includes('/.agents/') || normalizedPath.includes('/governance/')) {
      process.stdout.write(JSON.stringify({
        decision: 'deny',
        reason: '【AI統治機構の自己改ざん防止】 .agents/ および governance/ 配下のファイルはAIによる書き込みが物理的に禁止されています。変更が必要な場合は人間が直接編集してください。'
      }));
      return;
    }

    // 2. Active Education: Prevent root package.json dependency additions / workspaces
    if (normalizedPath.endsWith('/package.json') && !normalizedPath.includes('/apps/')) {
      const content = payload?.toolCall?.args?.CodeContent || payload?.args?.CodeContent || payload?.toolCall?.args?.ReplacementContent || payload?.args?.ReplacementContent;
      if (content && (content.includes('"dependencies"') || content.includes('"workspaces"'))) {
        process.stdout.write(JSON.stringify({
          decision: 'deny',
          reason: '【境界防衛型モノレポの掟】 ルートの package.json に dependencies や workspaces を追加することは禁止されています。各アプリは apps/<name> の中で完全に独立させてください。'
        }));
        return;
      }
    }

    // 3. Active Education: Prevent packages/ directory creation
    if (normalizedPath.includes('/packages/')) {
      process.stdout.write(JSON.stringify({
        decision: 'deny',
        reason: '【境界防衛型モノレポの掟】 共通パッケージ (packages/) を作ることは禁止されています。共有による依存地獄を避けるため、コードの再利用はテンプレートからのコピペで行ってください。'
      }));
      return;
    }

    // 4. Active Education: Prevent editing existing migrations
    if (normalizedPath.includes('/db/supabase/migrations/') || normalizedPath.includes('/supabase/migrations/')) {
      // NOTE: True mechanical enforcement is in done.js (checking git status). This is just a pre-tool early warning.
      if (!payload?.toolCall?.args?.TargetFile && !payload?.toolCall?.args?.Overwrite && !payload?.toolCall?.args?.Append) {
          // It's likely a replace_file_content tool call, implying edit of an existing file.
          process.stdout.write(JSON.stringify({
            decision: 'deny',
            reason: '【データベース追記型の掟】 既存のマイグレーションファイルを編集することは禁止されています。変更は常に新しいマイグレーションファイル（新規追加）で行ってください。'
          }));
          return;
      }
    }

    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  } catch (err) {
    process.stdout.write(JSON.stringify({ 
      decision: 'deny', 
      reason: `write-safety-check内部で致命的エラーが発生しました。フェイルクローズ原則により書き込みを遮断します: ${err.message}` 
    }));
  }
}

main();
