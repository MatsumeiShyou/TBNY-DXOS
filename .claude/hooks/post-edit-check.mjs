// PostToolUse: Write | Edit | MultiEdit
// 編集したファイルが属するアプリだけを対象に、ESLint（エラーのみ）と型チェックを実行する。
// 失敗した場合は decision: "block" で結果を Claude に返し、その場で修正させる（編集自体は取り消さない）。
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { projectRoot, toRelative, readInput } from './lib.mjs';

const MAX_REPORT = 3000;

export function appOf(rel) {
  const m = rel && rel.match(/^apps\/([^/]+)\/.+\.(ts|tsx|js|jsx|mjs|cjs)$/);
  return m ? m[1] : null;
}

function run(appRoot, args) {
  try {
    execFileSync(process.execPath, args, { cwd: appRoot, encoding: 'utf8', stdio: 'pipe', timeout: 80000 });
    return null;
  } catch (err) {
    return `${err.stdout || ''}${err.stderr || ''}`.trim() || err.message;
  }
}

export function check(filePath, root = projectRoot()) {
  const rel = toRelative(filePath, root);
  const app = appOf(rel);
  if (!app) return null;
  const appRoot = path.join(root, 'apps', app);
  const problems = [];

  const eslint = path.join(appRoot, 'node_modules/eslint/bin/eslint.js');
  if (fs.existsSync(eslint)) {
    const out = run(appRoot, [eslint, '--quiet', path.resolve(root, rel)]);
    if (out) problems.push(`[ESLint エラー]\n${out}`);
  }

  const tsc = path.join(appRoot, 'node_modules/typescript/bin/tsc');
  if (/\.(ts|tsx)$/.test(rel) && fs.existsSync(tsc) && fs.existsSync(path.join(appRoot, 'tsconfig.json'))) {
    const buildInfo = path.join(appRoot, 'node_modules/.cache/claude-tsc.tsbuildinfo');
    const out = run(appRoot, [tsc, '--noEmit', '--incremental', '--tsBuildInfoFile', buildInfo]);
    if (out) problems.push(`[型エラー]\n${out}`);
  }

  if (problems.length === 0) return null;
  const report = problems.join('\n\n');
  return `apps/${app} の検査で問題が見つかりました（${rel} の編集後）。修正してください。\n\n` +
    (report.length > MAX_REPORT ? report.slice(0, MAX_REPORT) + '\n…（以下省略）' : report);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const input = await readInput();
    const reason = check(input.tool_input?.file_path);
    if (reason) process.stdout.write(JSON.stringify({ decision: 'block', reason }));
  } catch (err) {
    // 検査の失敗で作業を止めない（編集は既に完了している）。理由だけ伝える
    process.stderr.write(`[post-edit-check] 検査を実行できませんでした: ${err.message}\n`);
  }
}
