import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const LOCK_FILE = path.join(process.cwd(), '.agent', 'session', 'safemode.lock');

function main() {
  console.log('[recovery] Starting Emergency Recovery Layer...');

  try {
    // Restore governance/ and .agent/scripts/ directories from HEAD
    console.log('[recovery] Restoring governance/ and .agent/scripts/ from HEAD...');
    execSync('git checkout HEAD -- governance/ .agent/scripts/', { stdio: 'inherit' });
    console.log('[recovery] Successfully restored governance/ and .agent/scripts/ directories.');

    // Ensure session directory exists and create lock file
    const lockDir = path.dirname(LOCK_FILE);
    if (!fs.existsSync(lockDir)) {
      fs.mkdirSync(lockDir, { recursive: true });
    }

    const lockData = {
      timestamp: new Date().toISOString(),
      reason: 'Emergency recovery triggered. System placed in Safe Mode.',
      status: 'LOCKED'
    };

    fs.writeFileSync(LOCK_FILE, JSON.stringify(lockData, null, 2), 'utf8');
    console.log(`[recovery] Safe Mode activated. Lock file generated: ${LOCK_FILE}`);
    console.log('[recovery] Emergency recovery sequence complete.');
  } catch (error) {
    console.error('[recovery] ERROR: Failed to execute recovery sequence.');
    console.error(error.message || error);
    process.exit(1);
  }
}

main();
