// 実行: node --test .claude/hooks/hooks.test.mjs
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { judgeWrite } from './guard-write.mjs';
import { judgeBash } from './guard-bash.mjs';
import { appOf } from './post-edit-check.mjs';
import { classifyDebts, buildContext } from './session-context.mjs';

// 実リポジトリに依存しない仮のプロジェクトルート
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tbny-hooks-'));
fs.mkdirSync(path.join(root, 'governance'));
fs.writeFileSync(path.join(root, 'governance/root_allowlist.json'), JSON.stringify({
  allowed_root_files: ['AGENTS.md', 'package.json', 'README.md'],
  allowed_root_directories: ['apps', 'db', 'docs', 'scripts', 'scratch']
}));
fs.mkdirSync(path.join(root, 'scripts'));
fs.writeFileSync(path.join(root, 'scripts/001_initial_schema.sql'), '-- existing');
after(() => fs.rmSync(root, { recursive: true, force: true }));

const write = (file, extra = {}) =>
  judgeWrite({ tool_name: 'Write', tool_input: { file_path: path.join(root, file), ...extra } }, root);
const bash = (command) => judgeBash({ tool_name: 'Bash', tool_input: { command }, cwd: root }, root);
const decision = (r) => (r ? r.decision : 'none');

test('通常のアプリ内の編集は判定しない（通常の権限確認に委ねる）', () => {
  assert.equal(decision(write('apps/repaper/src/App.tsx')), 'none');
  assert.equal(decision(write('scripts/015_new.sql')), 'none');
});

test('プロジェクト外のファイルは判定しない', () => {
  assert.equal(decision(judgeWrite({ tool_input: { file_path: path.join(os.tmpdir(), 'x.txt') } }, root)), 'none');
});

test('統治ファイルは人間の承認を求める', () => {
  for (const f of ['.claude/settings.json', '.claude/hooks/guard-bash.mjs', '.agents/scripts/verify-task.cjs',
    '.githooks/dispatch.cjs', '.github/workflows/ci.yml', 'governance/root_allowlist.json', 'AGENTS.md', 'CLAUDE.md']) {
    assert.equal(decision(write(f)), 'ask', f);
  }
});

test('ルートの許可リスト外は拒否', () => {
  assert.equal(decision(write('tmp_fix.js')), 'deny');
  assert.equal(decision(write('random/file.txt')), 'deny');
  assert.equal(decision(write('package-lock.json')), 'deny');
  assert.equal(decision(write('node_modules/x/index.js')), 'deny');
  assert.equal(decision(write('packages/ui/Button.tsx')), 'deny');
  assert.equal(decision(write('README.md')), 'none');
});

test('ルート package.json への依存追加は拒否', () => {
  assert.equal(decision(write('package.json', { content: '{ "private": true, "dependencies": {} }' })), 'deny');
  assert.equal(decision(write('package.json', { content: '{ "private": true }' })), 'none');
});

test('generated/ の直接編集と既存マイグレーションの編集は拒否', () => {
  assert.equal(decision(write('apps/repaper/src/types/generated/auth.ts')), 'deny');
  assert.equal(decision(write('scripts/001_initial_schema.sql')), 'deny');
  assert.equal(decision(write('db/supabase/migrations/20260101_x.sql')), 'none'); // 新規は可
});

test('統治の回避は拒否', () => {
  for (const c of [
    'git commit --no-verify -m "x"',
    'git commit -n -m "x"',
    'git -c core.hooksPath=/tmp/h commit -m "fix: x"',
    'touch .emergency-bypass',
    'node .agents/scripts/emergency.js "急ぎ"; git commit -m x && rm .emergency-bypass',
    'env -u CLAUDECODE git commit -m "x"',
    'icacls .agents /remove:d user',
    'git push --force origin master',
    'git push -f'
  ]) {
    assert.equal(decision(bash(c)), 'deny', c);
  }
});

test('取り消せない操作・外部公開は確認を求める', () => {
  for (const c of [
    'git reset --hard HEAD~1', 'git clean -fd', 'git checkout -- .', 'git restore .',
    'rm -rf dist', 'Remove-Item dist -Recurse -Force', 'psql -c "DROP TABLE x"', 'git push origin feature'
  ]) {
    assert.equal(decision(bash(c)), 'ask', c);
  }
});

test('Waiver 付きコミットは確認を求める（-m / heredoc / -F）', () => {
  assert.equal(decision(bash('git commit -m "Waiver: x"')), 'ask');
  assert.equal(decision(bash("git commit -F - <<'EOF'\nWaiver: x\nEOF")), 'ask');
  fs.writeFileSync(path.join(root, 'msg.txt'), 'Waiver: from file');
  assert.equal(decision(bash('git commit -F msg.txt')), 'ask');
});

test('日常的なコマンドは判定しない', () => {
  for (const c of [
    'git status', 'git diff --cached', 'git restore --staged .', 'git commit -m "fix(repaper): 修正\n\n- 箇条書き -n なし"',
    'npx tsc --noEmit > out.txt', 'echo hello > scratch/a.txt', 'npm test', 'rm scratch/a.txt', 'git switch -c fix/x'
  ]) {
    assert.equal(decision(bash(c)), 'none', c);
  }
});

test('post-edit-check はアプリ内のスクリプトだけを対象にする', () => {
  assert.equal(appOf('apps/repaper/src/App.tsx'), 'repaper');
  assert.equal(appOf('apps/repaper/src/index.css'), null);
  assert.equal(appOf('scripts/sync-shared.mjs'), null);
  assert.equal(appOf(null), null);
});

test('session-context は期限切れと期限間近の未解決負債を知らせる', () => {
  const now = new Date('2026-10-05T00:00:00Z');
  const ledger = { debts: [
    { id: 'A', reason: '期限切れ', deadline: '2026-10-04T00:00:00Z', resolved: false },
    { id: 'B', reason: '間近', deadline: '2026-10-06T00:00:00Z', resolved: false },
    { id: 'C', reason: '先', deadline: '2026-10-20T00:00:00Z', resolved: false },
    { id: 'D', reason: '解決済み', deadline: '2026-10-01T00:00:00Z', resolved: true }
  ] };
  const { expired, soon } = classifyDebts(ledger, now);
  assert.deepEqual(expired.map(d => d.id), ['A']);
  assert.deepEqual(soon.map(d => d.id), ['B']);

  const text = buildContext({ branch: 'master', ledger, now });
  assert.match(text, /作業用ブランチ/);
  assert.match(text, /\[A\]/);
  assert.doesNotMatch(text, /\[C\]|\[D\]/);
  assert.doesNotMatch(buildContext({ branch: 'fix/x', ledger: { debts: [] }, now }), /作業用ブランチ|負債/);
});
