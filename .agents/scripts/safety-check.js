/**
 * safety-check.js — PreToolUse hook for run_command
 * 
 * 危険なコマンドパターンを検出し、実行をブロックする。
 * 
 * I/O契約 (PreToolUse):
 *   stdin:  { toolCall: { name, args }, stepIdx, ...common }
 *   stdout: { decision: "allow"|"deny"|"ask"|"force_ask", reason: "..." }
 * 
 * 【厳守】デバッグログはすべてstderrに出力する。
 *         stdoutを汚すとJSONパースに失敗し、ツール呼び出しがブロックされる。
 */

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
];

async function main() {
  let input = '';
  
  // stdinからJSON入力を読み取る
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  try {
    const payload = JSON.parse(input);
    const commandLine = payload?.toolCall?.args?.CommandLine || 
                        payload?.toolCall?.args?.command || '';
    
    process.stderr.write(`[safety-check] Checking command: ${commandLine}\n`);

    for (const { pattern, reason } of DANGEROUS_PATTERNS) {
      if (pattern.test(commandLine)) {
        const result = { decision: 'deny', reason: `⛔ ブロック: ${reason} — コマンド: ${commandLine}` };
        process.stdout.write(JSON.stringify(result));
        process.stderr.write(`[safety-check] DENIED: ${reason}\n`);
        return;
      }
    }

    const result = { decision: 'allow', reason: '安全なコマンドと判定' };
    process.stdout.write(JSON.stringify(result));
    process.stderr.write(`[safety-check] ALLOWED\n`);
  } catch (err) {
    process.stderr.write(`[safety-check] Error parsing input: ${err.message}\n`);
    // パースエラー時は安全側に倒してaskにする
    const result = { decision: 'ask', reason: `入力のパースに失敗しました: ${err.message}` };
    process.stdout.write(JSON.stringify(result));
  }
}

main();
