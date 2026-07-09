import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ENFORCER_PREFIX = '[ENFORCER]';

try {
  // 1. Check if the whole project is clean
  let isAllClean = false;
  try {
    execSync('npx eslint .', { stdio: 'ignore' });
    isAllClean = true;
  } catch (e) {
    isAllClean = false;
  }

  if (isAllClean) {
    console.log(`${ENFORCER_PREFIX} 全てのLintエラーが解消されました。トリガーを自己消去します。`);
    
    // Remove itself from .lintstagedrc.json
    try {
      const lintStagedPath = path.resolve('.lintstagedrc.json');
      if (fs.existsSync(lintStagedPath)) {
        const lintstagedrc = JSON.parse(fs.readFileSync(lintStagedPath, 'utf8'));
        if (lintstagedrc['*.{ts,tsx,js}']) {
          lintstagedrc['*.{ts,tsx,js}'] = lintstagedrc['*.{ts,tsx,js}'].filter((cmd: string) => !cmd.includes('enforce_any_cleanup.js'));
          fs.writeFileSync(lintStagedPath, JSON.stringify(lintstagedrc, null, 2));
        }
      }
    } catch (e) {
      console.warn(`${ENFORCER_PREFIX} .lintstagedrc.json の更新に失敗しました:`, e);
    }

    // Update DEBT_AND_FUTURE.md to mark it as resolved
    try {
      const debtPath = path.resolve('DEBT_AND_FUTURE.md');
      if (fs.existsSync(debtPath)) {
        let debt = fs.readFileSync(debtPath, 'utf8');
        debt = debt.replace(/- \[ \] \*\*120箇所の `any` 型の撲滅\*\*/g, '- [x] **120箇所の `any` 型の撲滅** (自動クリーンアップ完了)');
        fs.writeFileSync(debtPath, debt);
      }
    } catch (e) {
      console.warn(`${ENFORCER_PREFIX} DEBT_AND_FUTURE.md の更新に失敗しました:`, e);
    }
    
    // Delete this script
    try {
      fs.unlinkSync(__filename);
    } catch (e) {
      console.warn(`${ENFORCER_PREFIX} 自身の削除に失敗しました:`, e);
    }
    process.exit(0);
  }

  // 2. If not all clean, check staged files
  const stagedFiles = process.argv.slice(2);
  if (stagedFiles.length > 0) {
    try {
      console.log(`${ENFORCER_PREFIX} 編集ファイルの 'any' 型残存チェックを実行します...`);
      execSync(`npx eslint ${stagedFiles.join(' ')} --max-warnings=0`, { stdio: 'inherit' });
      console.log(`${ENFORCER_PREFIX} クリア！編集ファイルにエラーはありません。`);
    } catch (e) {
      console.error(`\n${ENFORCER_PREFIX} エラー: 編集したファイルに \`any\` 型（または他のLintエラー）が残っています。`);
      console.error(`${ENFORCER_PREFIX} コミット前に必ず修正してください（Boy Scout Rule）。\n`);
      process.exit(1);
    }
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
