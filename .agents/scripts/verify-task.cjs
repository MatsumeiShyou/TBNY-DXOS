#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const commitMsgFile = process.argv[2];
const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim();

console.log("【Governance v3.2】 完了境界の決定論的検証を開始します...");

let taskType = 'unknown';
let isWaiver = commitMsg.includes('Waiver:');

if (isWaiver) {
  console.log("-> Waiver (免除申請) を検知しました。保護パス検査をスキップします。");
}
if (/^fix(\(.*\))?:/.test(commitMsg)) taskType = 'fix';
else if (/^feat(\(.*\))?:/.test(commitMsg)) taskType = 'feat';
else if (/^refactor(\(.*\))?:/.test(commitMsg)) taskType = 'refactor';
else if (/^chore(\(.*\))?:/.test(commitMsg)) taskType = 'chore';
else if (isWaiver) taskType = 'waiver'; // Waiverのみのコミット用

if (taskType === 'unknown') {
  console.error("【Error】 コミットメッセージが不正です。fix:, feat:, refactor:, chore: のいずれかで開始してください。");
  process.exit(1);
}

// 2. Strict Staging Verification (ゴミ混入検査)
let stagedFiles = [];
try {
  // name-status で A(追加), M(変更) 等のステータス付きで取得
  const statusLines = execSync('git diff --cached --name-status').toString().trim().split('\n').filter(Boolean);
  
  for (const line of statusLines) {
    const [status, ...fileParts] = line.split('\t');
    const file = fileParts.join('\t').trim();
    stagedFiles.push(file);

    // 追加・変更されたファイルに対するゴミ判定
    if (status === 'A' || status === 'M') {
      const isTrash = 
        file.startsWith('.agents/scratch/') ||
        /^(patch_|fix_|tmp).*\.(cjs|js|ts|mjs)$/i.test(path.basename(file)) ||
        /\.(bak|orig)$/i.test(file) ||
        (file.includes('/') === false && /\.(mjs|cjs|ts|js)$/i.test(file) && file !== 'eslint.config.js' && file !== 'vitest.config.ts');
      
      if (isTrash) {
        console.error(`\n【Error】 一時ファイルやゴミ (${file}) がコミットに含まれています。`);
        console.error('"git add -A" のような横着は禁止です。必要なファイルのみを個別に git add してください。');
        process.exit(1);
      }
    }
  }
} catch (e) {
  console.error("【Error】 Gitステータスの取得に失敗しました。", e.message);
  process.exit(1);
}

// 3. 保護パス検査
const PROTECTED_PATHS = ['.agents', '.git/hooks', 'eslint.config.js', 'package.json', 'tsconfig', 'vitest'];
if (!isWaiver) {
  for (const file of stagedFiles) {
    if (PROTECTED_PATHS.some(p => file.includes(p))) {
      console.error(`\n【Error】 保護パス (${file}) が変更されています。`);
      
      // Human Override: TTY (人間の端末) であれば突破可能
      if (process.stdout.isTTY) {
        console.error("-> 【Human Override】 人間の操作を検知しました。");
        console.error("このまま緊急突破(コミット)しますか？ 突破する場合は Waiver: を付けて再度コミットするか、ここで処理を中断してください。");
        // シンプルにするため、TTYならヒントを出して一旦終了（今回は対話入力をブロックしないため）
      }
      console.error("-> AIの場合は Waiver: 宣言が必要です。");
      process.exit(1);
    }
  }
}

// 4. fail-to-pass 検証エンジン (chore以外)
if (taskType === 'chore' || taskType === 'waiver') {
  console.log(`-> [${taskType}] テスト検証免除。変更パスの静的解析のみ完了。`);
} else {
  // === V3 Engine Sandbox ===
  const worktreeDir = path.resolve('../temp-verify-worktree');
  const patchFile = path.resolve('../staged.patch');
  const sandboxNodeModules = path.join(worktreeDir, 'apps/repaper/node_modules');
  // worktree 削除時にジャンクション先（本物の node_modules）まで消されないよう、先にリンクだけ外す
  const unlinkSandboxNodeModules = () => {
    try { if (fs.existsSync(sandboxNodeModules)) execSync(`rmdir "${sandboxNodeModules}"`, { stdio: 'ignore' }); } catch (e) {}
  };

  try {
    console.log("-> 独立サンドボックス(worktree)を構築します...");
    execSync(`git diff --cached > ${patchFile}`);
    // フック実行中は git が GIT_INDEX_FILE=.git/index（相対パス）を渡してくる。
    // 継承すると worktree 内で解決され index.lock を作れず必ず失敗するため、以降のサンドボックス操作から外す
    delete process.env.GIT_INDEX_FILE;
    unlinkSandboxNodeModules();
    try { execSync(`git worktree remove --force ${worktreeDir}`, { stdio: 'ignore' }); } catch (e) {}
    execSync(`git worktree add ${worktreeDir} HEAD`, { stdio: 'ignore' });
    
    const patchContent = fs.readFileSync(patchFile, 'utf8');
    if (patchContent.trim() !== '') {
      execSync(`git apply ${patchFile}`, { cwd: worktreeDir });
    }

    // ルートに node_modules は存在しない（境界防衛）ため、アプリの node_modules をジャンクションで借りる
    if (!fs.existsSync(sandboxNodeModules)) {
       execSync(`mklink /J "${sandboxNodeModules}" "${path.resolve('apps/repaper/node_modules')}"`, { cwd: worktreeDir });
    }

    const testFiles = stagedFiles.filter(f => f.includes('.test.') || f.includes('__tests__'));
    const prodFiles = stagedFiles.filter(f => !testFiles.includes(f) && /\.tsx?$/.test(f));
    // 本番コードだけをパッチ単位で戻す/当て直す（新規追加ファイルも扱え、適用済みのテスト変更と衝突しない）
    const includeArgs = prodFiles.map(f => `--include="${f}"`).join(' ');

    if (taskType === 'fix') {
      console.log("-> [fix] fail-before 検証を開始...");
      if (testFiles.length === 0) throw new Error("No tests found");
      if (prodFiles.length > 0) execSync(`git apply -R ${includeArgs} "${patchFile}"`, { cwd: worktreeDir });

      try {
        execSync('npm test --run', { cwd: path.join(worktreeDir, 'apps/repaper'), stdio: 'ignore' });
        console.error("【Error】 旧コードでテストが GREEN になりました(fail-before 失敗)。");
        throw new Error("fail-before check failed");
      } catch (e) {
        console.log("   -> OK: 旧コードでのテスト失敗 (RED) を確認。");
      }
      
      if (prodFiles.length > 0) execSync(`git apply ${includeArgs} "${patchFile}"`, { cwd: worktreeDir });
    }

    console.log("-> pass-after 検証(全体GREEN)を開始...");
    try {
      execSync('npm test --run', { cwd: path.join(worktreeDir, 'apps/repaper'), stdio: 'ignore' });
      console.log("   -> OK: 新コードでのテスト成功 (GREEN) を確認。");
    } catch (e) {
      console.error("【Error】 新コードでテストが失敗しました (pass-after 失敗)。");
      throw new Error("pass-after check failed");
    }
  } catch (e) {
    console.error("\n【Governance v3.2】 検証失敗のためコミットを破棄します。");
    unlinkSandboxNodeModules();
    try { execSync(`git worktree remove --force ${worktreeDir}`, { stdio: 'ignore' }); } catch (err) {}
    process.exit(1);
  } finally {
    unlinkSandboxNodeModules();
    try { execSync(`git worktree remove --force ${worktreeDir}`, { stdio: 'ignore' }); } catch (e) {}
    try { fs.unlinkSync(patchFile); } catch (e) {}
  }
}

// 5. Automated Quarantine (自動隔離)
try {
  const scratchDir = path.resolve('.agents/scratch');
  if (fs.existsSync(scratchDir)) {
    const files = fs.readdirSync(scratchDir);
    const trashFiles = files.filter(f => !f.endsWith('.jsonl'));
    
    if (trashFiles.length > 0) {
      const qDir = path.resolve('.git/agent-quarantine', Date.now().toString());
      fs.mkdirSync(qDir, { recursive: true });
      
      for (const file of trashFiles) {
        const src = path.join(scratchDir, file);
        const dest = path.join(qDir, file);
        // ロックなどで移動できない場合も考慮して rename を試みる
        try { fs.renameSync(src, dest); } catch (e) {
            // fallback: コピーして削除
            fs.copyFileSync(src, dest);
            fs.unlinkSync(src);
        }
      }
      console.log(`-> 【Quarantine】 ${trashFiles.length} 件の一時ファイルを隔離(${qDir})しました。`);
    }
  }
} catch (e) {
  console.log("-> 隔離処理中にエラーが発生しましたが、コミットは継続します。", e.message);
}

console.log("【Governance v3.2】 全検証通過。コミット完了。");
process.exit(0);
