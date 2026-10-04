#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// The new boundary-defended dispatcher.
// It checks staged files and runs lint/type checks only in the affected apps.

try {
  const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .map(f => f.trim())
    .filter(Boolean);

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  // [Phase 3] Database Append-Only Enforcement
  const diffStatus = execSync('git diff --cached --name-status', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  diffStatus.forEach(line => {
    const [status, file] = line.split('\t');
    const filePosix = file.split(path.sep).join('/');
    if (filePosix.startsWith('db/supabase/migrations/')) {
      if (status !== 'A') {
        console.error(`🚨 【データベース追記型の掟】 既存のマイグレーションファイルを変更・削除することは禁止されています。`);
        console.error(`違反ファイル: ${file} (ステータス: ${status})`);
        process.exit(1);
      }
    }
  });

  // Find all affected apps
  const affectedApps = new Set();
  let dbAffected = false;

  stagedFiles.forEach(file => {
    const absPath = path.join(gitRoot, file);
    // Normalize slashes
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

  // DB affected = test all apps (Phase 3 logic)
  if (dbAffected) {
    const appsDir = path.join(gitRoot, 'apps');
    if (fs.existsSync(appsDir)) {
      const apps = fs.readdirSync(appsDir);
      apps.forEach(app => {
        const appRoot = path.join(appsDir, app);
        if (fs.existsSync(path.join(appRoot, 'package.json'))) {
          affectedApps.add(appRoot);
        }
      });
    }
  }

  let failed = false;

  // Run tsc in affected apps
  affectedApps.forEach(appRoot => {
    const relName = path.relative(gitRoot, appRoot) || 'root';
    console.log(`\n> Running type checks for ${relName}...`);
    try {
      const tscPath = path.join(appRoot, 'node_modules', '.bin', 'tsc');
      if (fs.existsSync(tscPath)) {
        // [Layer 2 Firewall] Generate an externally injected, strict tsconfig
        const strictTsConfig = {
          extends: "./tsconfig.json",
          compilerOptions: {
            paths: {}, // Disable all alias paths to prevent bypasses
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
            noEmit: true
          },
          include: ["src/**/*"],
          exclude: ["node_modules"]
        };
        const tempTsConfigPath = path.join(appRoot, 'tsconfig.strict.temp.json');
        fs.writeFileSync(tempTsConfigPath, JSON.stringify(strictTsConfig, null, 2), 'utf8');

        try {
          execSync(`"${tscPath}" --project tsconfig.strict.temp.json`, { cwd: appRoot, stdio: 'inherit' });
          console.log(`✅ Passed: ${relName}`);
        } finally {
          if (fs.existsSync(tempTsConfigPath)) {
            fs.unlinkSync(tempTsConfigPath);
          }
        }
      } else {
        console.log(`⚠️ Skipped: No tsc found in ${relName}`);
      }
    } catch (e) {
      console.error(`❌ Failed type check in ${relName}`);
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
