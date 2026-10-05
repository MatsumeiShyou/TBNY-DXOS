// PreToolUse: Bash | PowerShell
// 統治の回避と、取り消せない破壊的操作だけを止める。
// （リダイレクト全般の禁止のような誤検知の多い規則は置かない。ルートの純化は git フックの許可リストで担保する）
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { projectRoot, runPreToolUse } from './lib.mjs';

// Claude 経由では実行させない（統治そのものの無効化）
const DENY_RULES = [
  { re: /\bgit\b[^\n;|&]*\s--no-verify\b/, reason: 'git フックを迂回する --no-verify は禁止です。フックが失敗した場合は原因を直してください。' },
  { re: /\bgit\b[^\n;|&]*\bcommit\b[^\n;|&]*\s-[a-zA-Z]*n[a-zA-Z]*\b/, reason: 'git commit -n（--no-verify）は禁止です。' },
  { re: /\bcore\.hooksPath\b/, reason: 'core.hooksPath の変更・上書きは git フックの無効化にあたるため禁止です。' },
  { re: /\.emergency-bypass\b/, reason: '緊急バイパスは人間専用です。必要な場合は人間が自分の端末で node .agents/scripts/emergency.js を実行します。' },
  { re: /(\bunset\s+CLAUDECODE\b|\benv\s+-u\s+CLAUDECODE\b|\bCLAUDECODE=|\$env:CLAUDECODE)/, reason: 'CLAUDECODE は git フックが AI の操作を識別するための目印です。変更・削除は禁止です。' },
  { re: /\b(icacls|takeown)\b|governance_lock\.ps1/, reason: '統治ファイルの ACL 操作は人間専用です（UAC を伴う governance_lock.ps1 を人間が実行します）。' },
  { re: /\bgit\b[^\n;|&]*\bpush\b[^\n;|&]*(\s--force\b|\s-f\b|\s\+\S)/, reason: '強制 push は履歴を破壊するため禁止です。' }
];

// 実行は可能だが、その場で人間の承認を求める
const ASK_RULES = [
  { re: /\bgit\b[^\n;|&]*\breset\b[^\n;|&]*--hard\b/, reason: 'git reset --hard は未コミットの変更を取り消せない形で破棄します。' },
  { re: /\bgit\b[^\n;|&]*\bclean\b[^\n;|&]*\s-[a-zA-Z]*f/, reason: 'git clean -f は追跡外ファイルを一括削除します。' },
  { re: /\bgit\b[^\n;|&]*\b(checkout|restore)\b[^\n;|&]*\s(--\s+)?\.(\s|$)/, unless: /\brestore\s+--staged\s+\.(\s|$)/, reason: '作業ツリー全体の変更を破棄する操作です。' },
  { re: /\brm\s+(-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)\b/, reason: '再帰削除です。対象を確認してください。' },
  { re: /\bRemove-Item\b[^\n;|]*-Recurse\b/i, reason: '再帰削除です。対象を確認してください。' },
  { re: /\b(rmdir|rd|del)\s+\/[sS]\b/, reason: '再帰削除です。対象を確認してください。' },
  { re: /\b(drop\s+(table|database|schema)|truncate\s+table)\b/i, reason: 'データを不可逆に削除する SQL です。' },
  { re: /\bgit\b[^\n;|&]*\bpush\b/, reason: 'リモートへの push は外部に公開される操作です。' }
];

// git commit のメッセージ本文（-m / heredoc はコマンド文字列に含まれる。-F <file> はファイルを読む）
function commitMessageOf(command, cwd) {
  let text = command;
  const fileArg = command.match(/\bcommit\b[^\n]*?\s(?:-F|--file[= ])\s*("[^"]+"|'[^']+'|[^\s;|&]+)/);
  if (fileArg && fileArg[1] !== '-') {
    const file = fileArg[1].replace(/^["']|["']$/g, '');
    try { text += '\n' + fs.readFileSync(path.resolve(cwd, file), 'utf8'); } catch { /* 読めない場合はコマンド文字列のみで判定 */ }
  }
  return text;
}

export function judgeBash(input, root = projectRoot()) {
  const command = input.tool_input?.command;
  if (typeof command !== 'string' || !command.trim()) return null;

  for (const rule of DENY_RULES) {
    if (rule.re.test(command)) return { decision: 'deny', reason: `[統治] ${rule.reason}` };
  }

  // Waiver: は保護パス検査とテスト検証を免除する宣言。AI の自己申告で通さず、人間がその場で確認する
  if (/\bgit\b[^\n;|&]*\bcommit\b/.test(command) && /\bWaiver:/.test(commitMessageOf(command, input.cwd || root))) {
    return {
      decision: 'ask',
      reason: '[統治] Waiver（検証免除）付きのコミットです。統治ファイルの変更内容と免除理由を確認のうえ承認してください。'
    };
  }

  for (const rule of ASK_RULES) {
    if (rule.re.test(command) && !(rule.unless && rule.unless.test(command))) {
      return { decision: 'ask', reason: `[確認] ${rule.reason}` };
    }
  }
  return null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runPreToolUse(input => judgeBash(input));
}
