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
    const reason = fs.readFileSync(bypassFile, 'utf8');
    fs.unlinkSync(bypassFile);
    console.log(`\n🚨 [EMERGENCY BYPASS] 緊急回避が作動しました。全ての検査をスキップします。`);
    console.log(`理由: ${reason}\n`);
    process.exit(0);
  }

  // --- Step 3: Debt Deadline Check ---
  if (fs.existsSync(ledgerFile)) {
    const ledger = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
    const now = new Date();
    const expired = ledger.debts.filter(d => !d.resolved && new Date(d.deadline) < now);
    if (expired.length > 0) {
      console.error('\n❌ [エラー] 「後で直すリスト」に期限切れのタスクがあります！');
      expired.forEach(d => console.error(` - [${d.id}] ${d.reason} (期限: ${d.deadline})`));
      console.error('これらを解決（resolved: trueに更新するか問題を修正）するまでコミットは許可されません。');
      process.exit(1);
    }
  }

  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .map(f => f.trim())
    .filter(Boolean);

  if (stagedFiles.length === 0) {
    process.exit(0);
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
  let newWarnings = [];

  // Run checks in affected apps
  affectedApps.forEach(appRoot => {
    const relName = path.relative(gitRoot, appRoot) || 'root';
    console.log(`\n> Running checks for ${relName}...`);
    
    // 1. ESLint Check (with JSON output to parse errors/warnings)
    try {
      const eslintPath = path.join(appRoot, 'node_modules', '.bin', 'eslint');
      if (fs.existsSync(eslintPath)) {
        try {
          const eslintOut = execSync(`"${eslintPath}" . --format json`, { cwd: appRoot, encoding: 'utf8' });
        } catch (e) {
          // ESLint returns non-zero on error
          if (e.stdout) {
            const results = JSON.parse(e.stdout);
            const hasErrors = results.some(r => r.errorCount > 0);
            if (hasErrors) {
              console.error(`❌ ESLint Error in ${relName}`);
              execSync(`"${eslintPath}" .`, { cwd: appRoot, stdio: 'inherit' });
              failed = true;
            } else {
              // Only warnings -> register debt
              const warnCount = results.reduce((acc, r) => acc + r.warningCount, 0);
              console.log(`⚠️ ESLint Warnings in ${relName}: ${warnCount}件`);
              newWarnings.push({
                app: relName,
                count: warnCount,
                reason: `ESLint warnings in ${relName}`
              });
            }
          } else {
            console.error(`❌ ESLint failed to execute in ${relName}`);
            failed = true;
          }
        }
      }
    } catch (e) {
      console.error(`Failed to run ESLint in ${relName}:`, e.message);
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

  // --- Register New Warnings as Debt ---
  if (newWarnings.length > 0) {
    let ledger = { debts: [] };
    if (fs.existsSync(ledgerFile)) {
      ledger = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
    }
    newWarnings.forEach(w => {
      ledger.debts.push({
        id: 'LINT-' + Date.now() + Math.floor(Math.random() * 1000),
        type: 'LINT_WARNING',
        reason: w.reason,
        createdAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        resolved: false
      });
    });
    if (!fs.existsSync(path.dirname(ledgerFile))) {
      fs.mkdirSync(path.dirname(ledgerFile), { recursive: true });
    }
    fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2), 'utf8');
    console.log(`\n📝 軽微な警告を「後で直すリスト」に記録しました (期限: 14日後)`);
    // automatically add the ledger file to the commit if possible, but standard hooks shouldn't modify index
    // so we just let it be untracked or modified for the next commit.
  }

  process.exit(0);
} catch (e) {
  console.error('Fatal pre-commit hook error:', e.message);
  process.exit(1);
}
