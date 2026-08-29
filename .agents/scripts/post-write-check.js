import { execSync } from 'child_process';

async function main() {
  let input = '';
  
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  try {
    const payload = JSON.parse(input);
    const targetFile = payload?.args?.TargetFile;

    // 対象がJS/JSXファイル以外、またはファイルパスが存在しない場合はチェックスキップ
    if (!targetFile || !targetFile.match(/\.(js|jsx)$/)) {
      process.stdout.write('{}');
      return;
    }

    try {
      // ESLintの自動修正（自己修復）を同期実行、タイムアウト5秒
      execSync(`npx eslint --fix "${targetFile}"`, { encoding: 'utf8', timeout: 5000 });
      process.stderr.write(`[post-write-check] ✅ ESLint fix applied successfully for ${targetFile}\n`);
      process.stdout.write('{}');
    } catch (lintErr) {
      if (lintErr.code === 'ETIMEDOUT' || lintErr.signal === 'SIGTERM') {
        process.stderr.write(`[post-write-check] 🚨 タイムアウト: ESLintの実行が5秒を超過したため強制終了しました。(${targetFile})\n`);
        process.stdout.write(JSON.stringify({ additionalContext: `ESLint Error: 実行がタイムアウト（5秒超過）しました。対象ファイルが大きすぎるか、無限ループの可能性があります。` }));
        return;
      }

      // 静的解析エラーが発生した場合
      process.stderr.write(`[post-write-check] ⚠️ ESLint found errors in ${targetFile}\n`);
      
      const stdoutStr = lintErr.stdout || '';
      const stderrStr = lintErr.stderr || '';
      const errorMsg = `ESLint Error in ${targetFile}:\n${stdoutStr}\n${stderrStr}\n上記のエラーを自己修復ループ内で解消してください。`;
      
      // エージェントへ追加コンテキストとしてエラー内容を注入
      process.stdout.write(JSON.stringify({ additionalContext: errorMsg }));
    }
  } catch (err) {
    process.stderr.write(`[post-write-check] 🚨 Fatal error parsing input: ${err.message}\n`);
    process.stdout.write('{}');
  }
}

main();
