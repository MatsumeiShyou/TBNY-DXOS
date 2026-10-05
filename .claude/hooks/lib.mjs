// Claude Code フック共通処理
// 入力: stdin の JSON（tool_name / tool_input / cwd など）
// 出力: PreToolUse は permissionDecision を返す。判定なし（通常の権限確認に委ねる）の場合は何も出力しない。
//       ※ "allow" を返すとユーザーの権限確認を飛ばしてしまうため、許可を明示的に返すことはしない。
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function projectRoot() {
  return process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '../..');
}

export async function readInput() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  return input ? JSON.parse(input) : {};
}

// プロジェクトルートからの相対パス（/ 区切り）。プロジェクト外なら null
export function toRelative(filePath, root = projectRoot()) {
  if (!filePath) return null;
  const rel = path.relative(path.resolve(root), path.resolve(root, filePath));
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join('/');
}

export function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export function emitPreToolUse(decision, reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision,
      permissionDecisionReason: reason
    }
  }));
}

// 判定関数 (input) => { decision, reason } | null を実行する。
// フック自体が壊れた場合は全面停止（deny）でも素通し（無判定）でもなく、人間に判断を仰ぐ（ask）。
export async function runPreToolUse(judge) {
  try {
    const result = judge(await readInput());
    if (result) emitPreToolUse(result.decision, result.reason);
  } catch (err) {
    emitPreToolUse('ask', `[統治フック内部エラー] ${err.message}\n安全確認ができないため、人間の判断を求めます。`);
  }
}
