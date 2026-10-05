// PreToolUse: Write | Edit | MultiEdit | NotebookEdit
// ファイル書き込みを境界防衛ルールで検査する。
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { projectRoot, toRelative, readJson, runPreToolUse } from './lib.mjs';

// 統治機構そのもの。変更は可能だが、必ず人間がその場で承認する
export const GOVERNANCE_PATHS = ['.claude/', '.agents/', '.githooks/', '.github/', 'governance/'];
export const GOVERNANCE_FILES = ['AGENTS.md', 'CLAUDE.md', 'db/AGENTS.md'];

// root_allowlist.json に無くても常に存在してよいルート要素（統治・git 管理用）
const BUILTIN_ROOT_DIRS = ['.git', '.claude', '.agents', '.githooks', '.github', 'governance'];
const BUILTIN_ROOT_FILES = ['.gitignore'];

function newContentOf(toolInput = {}) {
  if (typeof toolInput.content === 'string') return toolInput.content;
  if (typeof toolInput.new_string === 'string') return toolInput.new_string;
  if (Array.isArray(toolInput.edits)) return toolInput.edits.map(e => e.new_string || '').join('\n');
  return '';
}

export function judgeWrite(input, root = projectRoot()) {
  const toolInput = input.tool_input || {};
  const target = toolInput.file_path || toolInput.notebook_path;
  const rel = toRelative(target, root);
  if (!rel) return null; // プロジェクト外（スクラッチ領域など）は通常の権限確認に委ねる

  const parts = rel.split('/');
  const top = parts[0];

  if (GOVERNANCE_FILES.includes(rel) || GOVERNANCE_PATHS.some(p => rel.startsWith(p))) {
    return {
      decision: 'ask',
      reason: `[統治ファイル] ${rel} は統治機構の一部です。人間の承認がある場合のみ変更できます。`
    };
  }

  // ルートの純化（境界防衛の掟 1）
  if (rel === 'package-lock.json' || top === 'node_modules') {
    return {
      decision: 'deny',
      reason: `[境界防衛] ルートに ${top} を作ることは禁止です。依存は各アプリ（apps/<app>/）の中で管理してください。`
    };
  }
  const allowlist = readJson(path.join(root, 'governance/root_allowlist.json'), {});
  const allowedDirs = [...(allowlist.allowed_root_directories || []), ...BUILTIN_ROOT_DIRS];
  const allowedFiles = [...(allowlist.allowed_root_files || []), ...BUILTIN_ROOT_FILES];
  const isRootFile = parts.length === 1;
  if ((isRootFile && !allowedFiles.includes(rel)) || (!isRootFile && !allowedDirs.includes(top))) {
    return {
      decision: 'deny',
      reason: `[境界防衛] ${rel} はルートの許可リスト（governance/root_allowlist.json）にありません。` +
        '一時ファイルは scratch/ かセッションのスクラッチ領域へ、恒久ファイルは apps/ や db/ など適切な場所に置いてください。'
    };
  }

  if (rel === 'package.json' && /"(dependencies|devDependencies|workspaces)"/.test(newContentOf(toolInput))) {
    return {
      decision: 'deny',
      reason: '[境界防衛] ルートの package.json に dependencies / workspaces を追加することは禁止です（境界マーカー専用）。'
    };
  }

  // 共有パッケージ禁止（境界防衛の掟 2）
  if (top === 'packages') {
    return {
      decision: 'deny',
      reason: '[境界防衛] packages/ などの共有ディレクトリは禁止です。UI 部品は apps/_template/ から対象アプリへコピーしてください。'
    };
  }

  // 自動生成ファイルの直接編集禁止
  if (/^apps\/[^/]+\/src\/types\/generated\//.test(rel)) {
    return {
      decision: 'deny',
      reason: '[DB共有型] generated/ は自動生成です。原本の db/shared/ を編集し、node scripts/sync-shared.mjs で全アプリへ配布してください。'
    };
  }

  // マイグレーションは追記のみ（境界防衛の掟 4）
  const isMigration = /(^|\/)migrations\/[^/]+\.sql$/.test(rel) || /^scripts\/\d{3}_[^/]+\.sql$/.test(rel);
  if (isMigration && fs.existsSync(path.join(root, rel))) {
    return {
      decision: 'deny',
      reason: `[DB変更の掟] 既存のマイグレーション ${rel} の編集は禁止です。変更内容は新しい連番のファイルとして追加してください。`
    };
  }

  return null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runPreToolUse(input => judgeWrite(input));
}
