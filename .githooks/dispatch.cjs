#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  const bypassFile = path.join(gitRoot, '.emergency-bypass');
  const ledgerFile = path.join(gitRoot, 'docs', 'debt_ledger.json');

  // --- Step 4: Emergency Bypass ---
  if (fs.existsSync(bypassFile)) {
    // 緊急バイパスは人間専用。Claude Code のシェルには CLAUDECODE=1 が付く
    if (process.env.CLAUDECODE) {
      console.error('\n❌ [BLOCKED] 緊急バイパスは人間専用です。AIセッション(CLAUDECODE)からは使用できません。');
      console.error(`人間が内容を確認のうえ、自分の端末からコミットするか ${bypassFile} を削除してください。`);
      process.exit(1);
    }
    const reason = fs.readFileSync(bypassFile, 'utf8');
    fs.unlinkSync(bypassFile);
    console.log(`\n🚨 [EMERGENCY BYPASS] 緊急回避が作動しました。全ての検査をスキップします。`);
    console.log(`理由: ${reason}\n`);
    process.exit(0);
  }

  // --- Step 3: Debt Deadline Check ---
  // ステージ済みの台帳で判定する（台帳を resolved にするコミット自体が止まるデッドロックを防ぐ）
  let ledgerText = null;
  try {
    ledgerText = execSync('git show :docs/debt_ledger.json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    if (fs.existsSync(ledgerFile)) ledgerText = fs.readFileSync(ledgerFile, 'utf8');
  }
  if (ledgerText) {
    const ledger = JSON.parse(ledgerText);
    const now = new Date();
    const expired = ledger.debts.filter(d => !d.resolved && new Date(d.deadline) < now);
    if (expired.length > 0) {
      console.error('\n❌ [エラー] 「後で直すリスト」に期限切れのタスクがあります！');
      expired.forEach(d => console.error(` - [${d.id}] ${d.reason} (期限: ${d.deadline})`));
      console.error('これらを解決（resolved: trueに更新するか問題を修正）するまでコミットは許可されません。');
      console.error('resolved にした docs/debt_ledger.json をステージすれば、そのコミットは通過します。');
      process.exit(1);
    }
  }

  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .map(f => f.trim())
    .filter(Boolean);

  if (stagedFiles.length === 0) { process.exit(0); }

  // --- Step 1: Root Directory Protection (Whitelist Enforcement) ---
  const allowlistPath = path.join(gitRoot, 'governance/root_allowlist.json');
  if (fs.existsSync(allowlistPath)) {
    const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
    const allowedFiles = allowlist.allowed_root_files || [];
    const allowedDirs = allowlist.allowed_root_directories || [];
    
    // Allow standard governance/git files that might not be in the explicit list but are safe
    const builtinAllowedFiles = ['.gitignore', '.emergency-bypass', 'AGENTS.md', 'DEBT_AND_FUTURE.md', 'package.json', 'README.md', 'package-lock.json'];
    const builtinAllowedDirs = ['.git', '.githooks', '.github', '.husky', '.agents', 'governance'];
    
    // 削除は対象外（許可リスト外の痕跡を消すコミットが止まらないように。追加・変更・リネーム先のみ検査）
    const addedOrModified = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' })
      .split('\n').map(f => f.trim()).filter(Boolean);
    addedOrModified.forEach(file => {
      const filePosix = file.split(path.sep).join('/');
      const parts = filePosix.split('/');

      const isAllowedFile = parts.length === 1 && (allowedFiles.includes(parts[0]) || builtinAllowedFiles.includes(parts[0]));
      const isAllowedDir = parts.length > 1 && (allowedDirs.includes(parts[0]) || builtinAllowedDirs.includes(parts[0]));
      
      if (!isAllowedFile && !isAllowedDir) {
        console.error('\n[BLOCKED] ルート直下または未許可ディレクトリへのファイル追加は禁止されています: ' + filePosix);
        console.error('許可されたディレクトリ(apps/ 等)に移動するか、root_allowlist.json を更新してください。');
        process.exit(1);
      }
    });
  }


  // Phase 3: DB Append-Only Enforcement
  const diffStatus = execSync('git diff --cached --name-status', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  diffStatus.forEach(line => {
    const [status, file] = line.split('\t');
    const filePosix = file.split(path.sep).join('/');
    if (filePosix.startsWith('db/supabase/migrations/')) {
      if (status !== 'A') {
        console.error(`\n❌ 【データ変更の掟】既存のマイグレーションファイルを変更・削除することは禁止されています。`);
        console.error(`違反ファイル: ${file} (ステータス: ${status})`);
        process.exit(1);
      }
    }
  });

  // --- Step 1: Strict Copy Verification (db/shared) ---
  const sharedDir = path.join(gitRoot, 'db', 'shared');
  if (fs.existsSync(sharedDir)) {
    const sharedFiles = fs.readdirSync(sharedDir).filter(f => f.endsWith('.ts') || f.endsWith('.json'));
    const appsDir = path.join(gitRoot, 'apps');
    if (fs.existsSync(appsDir)) {
      const apps = fs.readdirSync(appsDir);
      apps.forEach(app => {
        const appRoot = path.join(appsDir, app);
        if (fs.existsSync(path.join(appRoot, 'package.json'))) {
          const generatedDir = path.join(appRoot, 'src', 'types', 'generated');
          sharedFiles.forEach(file => {
            const destFile = path.join(generatedDir, file);
            if (fs.existsSync(destFile)) {
              // We could check exact content, but simpler: check if it's staged
              // If the user staged an edit to apps/*/src/types/generated/*, we block it.
              // They MUST run sync-shared.mjs and NOT edit it locally.
            }
          });
        }
      });
    }
  }

  // Instead of complex content matching on every commit, we check if the staged file exactly matches what sync-shared.mjs would produce.
  stagedFiles.forEach(file => {
    const filePosix = file.split(path.sep).join('/');
    const match = filePosix.match(/^apps\/[^\/]+\/src\/types\/generated\/(.+)$/);
    if (match) {
      const fileName = match[1];
      const srcFile = path.join(gitRoot, 'db', 'shared', fileName);
      if (!fs.existsSync(srcFile)) {
        console.error(`\n❌ [エラー] ${file} に対応する原本 (db/shared/${fileName}) がありません。`);
        process.exit(1);
      }
      const expectedHeader = `// [自動生成] このファイルは db/shared/${fileName} から同期されました。\n// 絶対に直接編集しないでください。\n\n`;
      const expectedContent = expectedHeader + fs.readFileSync(srcFile, 'utf8');
      const actualContent = fs.readFileSync(path.join(gitRoot, file), 'utf8');
      if (expectedContent !== actualContent) {
        console.error(`\n❌ [エラー] ${file} が原本と一致しません。直接編集された可能性があります。`);
        console.error(`db/shared/${fileName} を修正し、 node scripts/sync-shared.mjs を実行してからコミットしてください。`);
        process.exit(1);
      }
    }
  });

  const affectedApps = new Set();
  let dbAffected = false;

  stagedFiles.forEach(file => {
    const absPath = path.join(gitRoot, file);
    const filePosix = file.split(path.sep).join('/');
    
    if (filePosix.startsWith('db/')) {
      dbAffected = true;
    } else if (filePosix.startsWith('apps/')) {
      const parts = filePosix.split('/');
      if (parts.length > 2) {
        const appRoot = path.join(gitRoot, 'apps', parts[1]);
        if (fs.existsSync(path.join(appRoot, 'package.json'))) {
          affectedApps.add(appRoot);
        }
      }
    }
  });

  // --- Step 2: DB Impact Notification ---
  if (dbAffected) {
    const appsDir = path.join(gitRoot, 'apps');
    const allApps = [];
    if (fs.existsSync(appsDir)) {
      fs.readdirSync(appsDir).forEach(app => {
        const appRoot = path.join(appsDir, app);
        if (fs.existsSync(path.join(appRoot, 'package.json'))) {
          affectedApps.add(appRoot);
          allApps.push(app);
        }
      });
    }
    console.log('\n======================================================');
    console.log('⚠️ [通知] データベース(db/)の変更が検知されました。');
    console.log('【3段階変更ルール】 ①拡張(今回) -> ②移行 -> ③縮小');
    console.log('以下の全アプリが将来的に新しいデータ形式への対応(②移行)が必要です:');
    allApps.forEach(app => console.log(` - apps/${app}`));
    console.log('======================================================\n');
  }

  let failed = false;
  const lintBaselineFile = path.join(gitRoot, 'docs', 'lint_baseline.json');
  const lintBaseline = fs.existsSync(lintBaselineFile) ? JSON.parse(fs.readFileSync(lintBaselineFile, 'utf8')) : {};

  // Run checks in affected apps
  affectedApps.forEach(appRoot => {
    const relName = path.relative(gitRoot, appRoot) || 'root';
    console.log(`\n> Running checks for ${relName}...`);
    
    // 1. ESLint Check: エラーは即ブロック。警告は基準値（docs/lint_baseline.json）からの増加のみブロック（ラチェット）
    //    ※ ESLint は警告だけなら終了コード 0 のため、成功時も JSON を解析する
    try {
      const eslintPath = path.join(appRoot, 'node_modules', '.bin', 'eslint');
      if (fs.existsSync(eslintPath)) {
        let eslintOut = '';
        try {
          eslintOut = execSync(`"${eslintPath}" . --format json`, { cwd: appRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
        } catch (e) {
          eslintOut = e.stdout || '';
        }
        let results = null;
        try {
          results = JSON.parse(eslintOut);
        } catch (e) {
          console.error(`❌ ESLint failed to execute in ${relName}`);
          failed = true;
        }
        if (results) {
          const errorCount = results.reduce((acc, r) => acc + r.errorCount, 0);
          const warnCount = results.reduce((acc, r) => acc + r.warningCount, 0);
          if (errorCount > 0) {
            console.error(`❌ ESLint Error in ${relName}: ${errorCount}件`);
            results.filter(r => r.errorCount > 0).slice(0, 10).forEach(r => {
              r.messages.filter(m => m.severity === 2).slice(0, 3).forEach(m => {
                console.error(`   ${path.relative(appRoot, r.filePath)}:${m.line} ${m.message} (${m.ruleId})`);
              });
            });
            failed = true;
          }
          const baseline = lintBaseline[relName.split(path.sep).join('/')];
          if (typeof baseline === 'number' && warnCount > baseline) {
            console.error(`❌ ESLint 警告が増えています (${relName}): 基準 ${baseline}件 → ${warnCount}件。増やした警告を解消してください。`);
            failed = true;
          } else if (typeof baseline === 'number' && warnCount < baseline) {
            console.log(`🎉 ESLint 警告が基準より減りました (${relName}): ${baseline}件 → ${warnCount}件。docs/lint_baseline.json を ${warnCount} に下げてください。`);
          } else {
            console.log(`✅ ESLint: ${relName}（警告 ${warnCount}件${typeof baseline === 'number' ? ` / 基準 ${baseline}件` : ''}）`);
          }
        }
      }
    } catch (e) {
      console.error(`Failed to run ESLint in ${relName}:`, e.message);
      failed = true;
    }

    // 2. TSC Check
    try {
      const tscPath = path.join(appRoot, 'node_modules', '.bin', 'tsc');
      if (fs.existsSync(tscPath)) {
        const strictTsConfig = {
          extends: "./tsconfig.json",
          compilerOptions: { paths: {}, noEmit: true },
          include: ["src/**/*"],
          exclude: ["node_modules"]
        };
        const tempTsConfigPath = path.join(appRoot, 'tsconfig.strict.temp.json');
        fs.writeFileSync(tempTsConfigPath, JSON.stringify(strictTsConfig, null, 2), 'utf8');

        try {
          execSync(`"${tscPath}" --project tsconfig.strict.temp.json`, { cwd: appRoot, stdio: 'pipe' });
          console.log(`✅ Passed TS check: ${relName}`);
        } catch (e) {
          console.error(`❌ TS Error in ${relName}`);
          // Print TS errors to console
          console.error(e.stdout ? e.stdout.toString() : e.message);
          failed = true;
        } finally {
          if (fs.existsSync(tempTsConfigPath)) {
            fs.unlinkSync(tempTsConfigPath);
          }
        }
      }
    } catch (e) {
      console.error(`Failed type check in ${relName}`);
      failed = true;
    }
  });

  if (failed) {
    console.error('\n🚨 Pre-commit hook failed.');
    process.exit(1);
  }

  process.exit(0);
} catch (e) {
  console.error('Fatal pre-commit hook error:', e.message);
  process.exit(1);
}
