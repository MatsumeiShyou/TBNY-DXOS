import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PATCHES_DIR = path.join(process.cwd(), '.agent', 'patches');
const LOCK_FILE = path.join(process.cwd(), '.agent', 'session', 'safemode.lock');

function main() {
  if (fs.existsSync(LOCK_FILE)) {
    console.error('\n[apply_patch] ❌ ERROR: セーフモード稼働中のため新規パッチの適用をブロックしました。');
    console.error('[apply_patch] ロックを解除するには完遂ゲートを --unlock オプション付きで実行してください。\n');
    process.exit(1);
  }

  console.log('[apply_patch] Scanning for patches in:', PATCHES_DIR);

  if (!fs.existsSync(PATCHES_DIR)) {
    console.error(`[apply_patch] Error: Patches directory does not exist: ${PATCHES_DIR}`);
    process.exit(1);
  }

  // Get patch and diff files
  const files = fs.readdirSync(PATCHES_DIR)
    .filter(file => file.endsWith('.patch') || file.endsWith('.diff'))
    .sort();

  if (files.length === 0) {
    console.log('[apply_patch] No patch or diff files found. Exiting successfully.');
    process.exit(0);
  }

  console.log(`[apply_patch] Found ${files.length} patch file(s) to apply.`);

  for (const file of files) {
    const filePath = path.join(PATCHES_DIR, file);
    console.log(`[apply_patch] Applying patch: ${file}...`);

    try {
      // Execute git apply. Wrap the path in quotes for Windows compatibility.
      // stdio: 'inherit' allows the user to see the exact conflict details from Git.
      execSync(`git apply "${filePath}"`, { stdio: 'inherit' });
      console.log(`[apply_patch] Successfully applied patch: ${file}`);

      // Delete applied patch file on success
      fs.unlinkSync(filePath);
      console.log(`[apply_patch] Deleted applied patch file: ${file}`);
    } catch (error) {
      console.error(`\n[apply_patch] ERROR: Failed to apply patch: ${file}`);
      console.error('[apply_patch] Aborting execution to ensure repository integrity. Remaining patches will not be applied.\n');
      process.exit(1);
    }
  }

  // 正常終了する直前に patch_applied.flag を生成
  const flagFile = path.join(process.cwd(), '.agent', 'session', 'patch_applied.flag');
  const flagDir = path.dirname(flagFile);
  if (!fs.existsSync(flagDir)) {
    fs.mkdirSync(flagDir, { recursive: true });
  }
  fs.writeFileSync(flagFile, JSON.stringify({ timestamp: new Date().toISOString(), status: 'VALID' }), 'utf8');
  console.log('[apply_patch] Generated patch_applied.flag successfully.');

  console.log('[apply_patch] All patches applied successfully.');
}

main();
