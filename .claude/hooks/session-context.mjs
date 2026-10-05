// SessionStart: 作業開始時に知っておくべき状態を Claude のコンテキストに入れる
// （標準出力の内容がそのままコンテキストになる）
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { projectRoot, readJson } from './lib.mjs';

const SOON_MS = 3 * 24 * 60 * 60 * 1000;

// 未解決の負債を「期限切れ」「期限間近」に分類する
export function classifyDebts(ledger, now = new Date()) {
  const open = (ledger?.debts || []).filter(d => !d.resolved && d.deadline);
  return {
    expired: open.filter(d => new Date(d.deadline) < now),
    soon: open.filter(d => {
      const left = new Date(d.deadline) - now;
      return left >= 0 && left <= SOON_MS;
    })
  };
}

export function buildContext({ branch, ledger, now = new Date() }) {
  const lines = [`[TBNY-DXOS] 現在のブランチ: ${branch || '不明'}`];
  if (branch === 'master' || branch === 'main') {
    lines.push('- デフォルトブランチ上です。変更をコミットする前に作業用ブランチを切ってください。');
  }
  const { expired, soon } = classifyDebts(ledger, now);
  const fmt = d => `  - [${d.id}] ${d.reason}（期限: ${d.deadline}）`;
  if (expired.length) {
    lines.push('- 期限切れの負債があり、git の pre-commit がすべてのコミットを拒否します。先に解消するか、docs/debt_ledger.json で resolved にしてください:');
    lines.push(...expired.map(fmt));
  }
  if (soon.length) {
    lines.push('- 3日以内に期限を迎える負債（期限を過ぎるとコミットが止まります）:');
    lines.push(...soon.map(fmt));
  }
  return lines.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const root = projectRoot();
    let branch = null;
    try {
      branch = execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim();
    } catch { /* git が使えない場合はブランチ不明として続行 */ }
    const ledger = readJson(path.join(root, 'docs/debt_ledger.json'), { debts: [] });
    process.stdout.write(buildContext({ branch, ledger }));
  } catch (err) {
    // セッション開始を妨げない
    process.stderr.write(`[session-context] ${err.message}\n`);
  }
}
