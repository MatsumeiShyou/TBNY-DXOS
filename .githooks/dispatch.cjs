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
  if (stagedFiles.length === 0) { process.exit(0); }
  // --- Step 1: Root Directory Protection (Whitelist Enforcement) ---
  const allowlistPath = path.join(gitRoot, 'governance/root_allowlist.json');
  if (fs.existsSync(allowlistPath)) {
    const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
    const allowedFiles = allowlist.allowed_root_files || [];
    const allowedDirs = allowlist.allowed_root_directories || [];
    
    // Built-in safe lists for governance and core project files
    const builtinAllowedFiles = [
      '.gitignore', '.emergency-bypass', 'AGENTS.md', 
      'DEBT_AND_FUTURE.md', 'package.json', 'README.md', 'package-lock.json'
    ];
    const builtinAllowedDirs = [
      '.git', '.githooks', '.github', '.husky', '.agents', 'governance'
    ];
    
    stagedFiles.forEach(file => {
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
  let hasDbDeleteOrModify = false;
  diffStatus.forEach(line => {
    const [status, ...fileParts] = line.split('\t');
    const file = fileParts.join('\t');
    if (file.startsWith('db/') && (status.startsWith('D') || status.startsWith('M'))) {
      if (file.includes('db/shared/')) {
        // 'db/shared' modifications are handled below
      } else {
        hasDbDeleteOrModify = true;
      }
    }
  });
  if (hasDbDeleteOrModify) {
    console.error('\n❌ [エラー] db/ 配下の既存ファイルの変更または削除は禁止されています。(Append-Only Principle)');
    console.error('スキーマ変更は必ず新規マイグレーションファイルを作成してください。');
    process.exit(1);
  }
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
    console.log('📣 [通知] データベース(db/)の変更が検知されました。');
    console.log('  段階変更ルール： １拡張(今回) -> ２移行 -> ３縮小');
    console.log('以下の全アプリが将来的に新しいデータ形式への対応（２移行）が必要です：');
    allApps.forEach(app => console.log(` - apps/${app}`));
    console.log('======================================================\n');
  }
  let failed = false;
  let newWarnings = [];
  // Run checks in affected apps
  affectedApps.forEach(appRoot => {
    const relName = path.relative(gitRoot, appRoot) || 'root';
    console.log(`\n> Running checks for ${relName}...`);
    
    // 1. ESLint Check
    try {
      const eslintPath = path.join(appRoot, 'node_modules', '.bin', 'eslint');
      if (fs.existsSync(eslintPath)) {
        try {
          execSync(`"${eslintPath}" . --format json`, { cwd: appRoot, encoding: 'utf8' });
        } catch (e) {
          if (e.stdout) {
            const results = JSON.parse(e.stdout);
            const hasErrors = results.some(r => r.errorCount > 0);
            if (hasErrors) {
              console.error(`❌ ESLint Error in ${relName}`);
              failed = true;
              try {
                execSync(`"${eslintPath}" .`, { cwd: appRoot, stdio: 'inherit' });
              } catch (err) {}
            } else {
              const warnCount = results.reduce((acc, r) => acc + r.warningCount, 0);
              console.log(`📣 ESLint Warnings in ${relName}: ${warnCount}件`);
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
    console.error('\n💥 Pre-commit hook failed.');
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
  }
  process.exit(0);
} catch (e) {
  console.error('Fatal pre-commit hook error:', e.message);
  process.exit(1);
}
