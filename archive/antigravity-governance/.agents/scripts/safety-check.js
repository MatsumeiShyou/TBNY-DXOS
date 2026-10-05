import fs from 'fs';

const DANGEROUS_PATTERNS = [
  { pattern: /rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|--recursive\s+--force|-[a-zA-Z]*f[a-zA-Z]*r)\b/i, reason: '再帰的な強制削除コマンド' },
  { pattern: /rm\s+-rf\b/i, reason: 'rm -rf は禁止されています' },
  { pattern: /git\s+clean\s+-fd/i, reason: 'git clean -fd は追跡外ファイルを一括削除します' },
  { pattern: /git\s+reset\s+--hard/i, reason: 'git reset --hard は変更を不可逆に破棄します' },
  { pattern: /drop\s+(table|database|schema)\b/i, reason: 'DROP文はデータを不可逆に削除します' },
  { pattern: /truncate\s+table\b/i, reason: 'TRUNCATE TABLEはデータを全削除します' },
  { pattern: /format\s+[a-zA-Z]:/i, reason: 'ディスクフォーマットは禁止です' },
  { pattern: /del\s+\/[sS]\b/i, reason: 'Windowsの再帰的削除は禁止です' },
  { pattern: /rmdir\s+\/[sS]\b/i, reason: 'Windowsの再帰的ディレクトリ削除は禁止です' },
  { pattern: /Remove-Item\s+.*-Recurse\s+.*-Force/i, reason: 'PowerShellの再帰的強制削除は禁止です' },
  
  // ルート直下へのシェル経由での書き込みを禁止するためのパターン (粗いが予防策)
  { pattern: />\s*[a-zA-Z0-9_\-\.]+\s*$/, reason: '[ROOT_WHITELIST_VIOLATION] リダイレクト(>)によるルート直下へのファイル作成は禁止です。apps/ 等に移動して実行してください。' },
  { pattern: /(?:Set-Content|Out-File)\s+(?:-Path\s+)?['"]?[a-zA-Z0-9_\-\.]+['"]?\s/i, reason: '[ROOT_WHITELIST_VIOLATION] PowerShellによるルート直下へのファイル作成は禁止です。' }
];

async function main() {
  let input = '';
  for await (const chunk of process.stdin) { input += chunk; }

  try {
    const payload = JSON.parse(input);
    const cmd = payload?.toolCall?.args?.CommandLine || payload?.args?.CommandLine;
    
    if (cmd) {
      for (const rule of DANGEROUS_PATTERNS) {
        if (rule.pattern.test(cmd)) {
          process.stdout.write(JSON.stringify({
            decision: 'deny',
            reason: rule.reason
          }));
          return;
        }
      }
    }

    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  } catch (err) {
    process.stdout.write(JSON.stringify({ 
      decision: 'deny', 
      reason: '[FAIL-CLOSED] safety-check内で致命的なエラーが発生しました。エラー詳細: ' + err.message 
    }));
  }
}

main();
