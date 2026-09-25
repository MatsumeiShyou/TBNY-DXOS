import { execSync } from 'child_process';
import fs from 'fs';

async function main() {
  let input = '';
  
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  try {
    const payload = JSON.parse(input);
    const targetFile = payload?.toolCall?.args?.TargetFile || payload?.args?.TargetFile;

    // 対象がJS/JSX/TS/TSXファイル以外、またはファイルが存在しない場合はチェックスキップ
    if (!targetFile || !targetFile.match(/\.(js|jsx|ts|tsx)$/) || !fs.existsSync(targetFile)) {
      process.stdout.write('{}');
      return;
    }

    try {
      // ESLintの自動修正（自己修復）を同期実行、タイムアウト8秒
      execSync(`npx eslint --fix "${targetFile}"`, { encoding: 'utf8', timeout: 8000 });
      process.stderr.write(`[post-write-check] ✅ ESLint fix applied successfully for ${targetFile}\n`);
      process.stdout.write('{}');
    } catch (lintErr) {
      if (lintErr.code === 'ETIMEDOUT' || lintErr.signal === 'SIGTERM') {
        process.stderr.write(`[post-write-check] 🚨 タイムアウト: ESLintの実行が超過したため強制終了しました。(${targetFile})\n`);
        process.stdout.write(JSON.stringify({ 
          additionalContext: `ESLint Error: 実行がタイムアウト（8秒超過）しました。対象ファイルが大きすぎるか、パースに時間がかかっています。` 
        }));
        return;
      }

      // 静的解析エラーが発生した場合
      process.stderr.write(`[post-write-check] ⚠️ ESLint found errors in ${targetFile}\n`);
      
      const stdoutStr = lintErr.stdout || '';
      const stderrStr = lintErr.stderr || '';
      const errorMsg = `ESLint Error in ${targetFile}:\n${stdoutStr.substring(0, 1000)}\n${stderrStr.substring(0, 1000)}\n上記のエラーを自己修復ループ内で解消してください。`;
      
      // PostToolUseフックは標準出力でコンテキスト注入できないため、stderrに出力してフック自体を失敗させる
      process.stderr.write(errorMsg + '\n');
      process.exit(1);
    }
  } catch (err) {
    process.stderr.write(`[post-write-check] 🚨 Fatal error parsing input: ${err.message}\n`);
    process.stdout.write('{}');
  }
}

main();
