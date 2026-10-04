#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

const commitMsgFile = process.argv[2];
const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim();

console.log("【Governance v3】 完了境界の決定論的検証を開始します...");

// 1. タスク種別の判定
let taskType = 'unknown';
let isWaiver = false;

if (commitMsg.includes('Waiver:')) {
  isWaiver = true;
  console.log("-> Waiver (免除申請) を検知しました。検証をスキップします。");
  process.exit(0);
} else if (/^fix(\(.*\))?:/.test(commitMsg)) {
  taskType = 'fix';
} else if (/^feat(\(.*\))?:/.test(commitMsg)) {
  taskType = 'feat';
} else if (/^refactor(\(.*\))?:/.test(commitMsg)) {
  taskType = 'refactor';
} else if (/^chore(\(.*\))?:/.test(commitMsg)) {
  taskType = 'chore';
}

if (taskType === 'unknown') {
  console.error("【Error】 コミットメッセージが不正です。fix:, feat:, refactor:, chore: のいずれかで開始してください。");
  process.exit(1);
}
console.log(`-> タスク種別: ${taskType}`);

// 2. 保護パスの検査 (フェーズ1)
const PROTECTED_PATHS = [
  '.agents',
  '.git/hooks',
  'eslint.config.js',
  'package.json',
  'tsconfig',
  'vitest'
];

try {
  // ステージされたファイルのリストを取得
  const stagedFiles = execSync('git diff --cached --name-only').toString().trim().split('\n').filter(Boolean);
  
  for (const file of stagedFiles) {
    if (PROTECTED_PATHS.some(p => file.includes(p))) {
      console.error(`\n【Error】 保護されたパス (${file}) への書き込みが検知されました。`);
      console.error("保護パスの変更には、人間の明示的承認(Proceed)と Waiver 免除宣言が必要です。");
      process.exit(1);
    }
  }
} catch (e) {
  console.error("【Error】 Gitステータスの取得に失敗しました。", e.message);
  process.exit(1);
}


// --- V3: Fail-to-Pass Verification Engine ---
if (taskType === 'chore') {
  console.log("-> [chore] テスト検証免除。変更パスの静的解析を行います。");
  const allowedExts = ['.css', '.html', '.md', '.json'];
  for (const file of stagedFiles) {
    if (!allowedExts.some(ext => file.endsWith(ext))) {
      console.error(`\n【Error】 chore タスクですが、許可されていないファイル(${file})が変更されています。`);
      process.exit(1);
    }
  }
  console.log("-> [chore] 検証パス。完了を許可します。");
  process.exit(0);
}

const worktreeDir = path.resolve('../temp-verify-worktree');
const patchFile = path.resolve('../staged.patch');

try {
  console.log("-> 独立したサンドボックス(worktree)を構築します...");
  
  // 1. ステージされた変更をパッチとして抽出
  execSync(`git diff --cached > ${patchFile}`);
  
  // 2. 既存の worktree があれば掃除
  try { execSync(`git worktree remove --force ${worktreeDir}`, { stdio: 'ignore' }); } catch (e) {}
  
  // 3. HEADから新しい worktree を作成
  execSync(`git worktree add ${worktreeDir} HEAD`, { stdio: 'ignore' });
  
  // 4. パッチを適用 (新コードと新テストの状態へ)
  const patchContent = fs.readFileSync(patchFile, 'utf8');
  if (patchContent.trim() !== '') {
    execSync(`git apply ${patchFile}`, { cwd: worktreeDir });
  }

  // npmモジュールの準備 (リンク)
  if (!fs.existsSync(path.join(worktreeDir, 'node_modules'))) {
     // Windowsの場合のシンボリックリンク(ジャンクション)
     execSync(`mklink /J node_modules "..\TBNY-DXOS\node_modules"`, { cwd: worktreeDir });
  }

  const isFix = taskType === 'fix';
  const isFeat = taskType === 'feat';
  const isRefactor = taskType === 'refactor';

  // 本番コードとテストコードを分離
  const testFiles = stagedFiles.filter(f => f.includes('.test.') || f.includes('__tests__'));
  const prodFiles = stagedFiles.filter(f => !testFiles.includes(f) && f.endsWith('.ts'));

  if (isFix) {
    console.log("-> [fix] fail-before 検証を開始します...");
    if (testFiles.length === 0) {
      console.error("【Error】 fix タスクには必ずテストコードの追加・修正が同伴しなければなりません。");
      throw new Error("No tests found");
    }

    // 本番コードのみ旧状態(HEAD)へ戻す
    if (prodFiles.length > 0) {
      execSync(`git checkout HEAD -- ${prodFiles.join(' ')}`, { cwd: worktreeDir });
    }

    // 新テストを旧コードに対して実行
    console.log("   (旧コード) npm test 実行中...");
    try {
      execSync('npm test --run', { cwd: path.join(worktreeDir, 'apps/repaper') });
      console.error("【Error】 旧コードに対してテストが GREEN になりました。これは応急処置(密輸)の疑いがあります(fail-before 失敗)。");
      throw new Error("fail-before check failed");
    } catch (e) {
      console.log("   -> OK: 旧コードでのテスト失敗 (RED) を確認しました。");
      // TODO: VitestのJSON出力から「アサーション失敗」であることを判定するロジックが必要
    }

    // 本番コードを新コードに戻す (再度パッチ適用)
    if (prodFiles.length > 0) {
      execSync(`git checkout HEAD -- ${prodFiles.join(' ')}`, { cwd: worktreeDir }); // 一旦リセット
      execSync(`git apply ${patchFile}`, { cwd: worktreeDir }); // 全て新状態へ
    }
  }

  if (isRefactor) {
    if (testFiles.length > 0) {
      console.error("【Error】 refactor タスクではテストコードの変更は許可されていません。");
      throw new Error("Refactor cannot change tests");
    }
  }

  console.log("-> pass-after 検証(全体GREEN)を開始します...");
  try {
    execSync('npm test --run', { cwd: path.join(worktreeDir, 'apps/repaper') });
    console.log("   -> OK: 新コードでのテスト成功 (GREEN) を確認しました。");
  } catch (e) {
    console.error("【Error】 新コードでテストが失敗しました (pass-after 失敗)。");
    throw new Error("pass-after check failed");
  }

  console.log("【Governance v3】 全ての検証を通過しました。コミット(完了)を許可します。");

} catch (e) {
  console.error("\n【Governance v3】 検証が失敗したため、コミットは破棄されました。");
  process.exit(1);
} finally {
  console.log("-> テンポラリ worktree を後始末します...");
  try { execSync(`git worktree remove --force ${worktreeDir}`, { stdio: 'ignore' }); } catch (e) {}
  try { fs.unlinkSync(patchFile); } catch (e) {}
}

console.log("-> 保護パス検査 OK. 次ステップのワークツリー検証へ進みます（実装中）...");
process.exit(0);