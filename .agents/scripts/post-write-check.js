/**
 * post-write-check.js — PostToolUse hook for file writes
 * 
 * ファイル書き込み後に軽量チェックを行う。
 * 現在はViteビルドチェックの代わりに構文検証のみ（Linter未設定のため）。
 * 
 * I/O契約 (PostToolUse):
 *   stdin:  { stepIdx, error?, ...common }
 *   stdout: {} (空のJSONオブジェクト — decision フィールドは存在しない)
 * 
 * 【厳守】デバッグログはすべてstderrに出力する。
 *         stdoutを汚すとJSONパースに失敗し、ツール呼び出しがブロックされる。
 */

async function main() {
  let input = '';
  
  // stdinからJSON入力を読み取る
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  try {
    const payload = JSON.parse(input);
    const stepIdx = payload?.stepIdx ?? 'unknown';
    const error = payload?.error;

    if (error) {
      process.stderr.write(`[post-write-check] Step ${stepIdx} had error: ${error}\n`);
    } else {
      process.stderr.write(`[post-write-check] Step ${stepIdx} completed successfully\n`);
    }

    // PostToolUse の契約: 空のJSONオブジェクトを返す
    process.stdout.write('{}');
  } catch (err) {
    process.stderr.write(`[post-write-check] Error parsing input: ${err.message}\n`);
    // エラー時でも空オブジェクトを返す（PostToolUseの契約）
    process.stdout.write('{}');
  }
}

main();
