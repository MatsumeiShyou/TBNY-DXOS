import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PATCHES_DIR = path.join(process.cwd(), '.agent', 'patches');

function main() {
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

  console.log('[apply_patch] All patches applied successfully.');
}

main();
