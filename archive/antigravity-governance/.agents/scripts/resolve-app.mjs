import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Dynamically resolves the app root for a given file.
 * In the Boundary-Defended Monorepo, the app root is the closest directory 
 * containing a package.json, up to the git root.
 * Only directories under 'apps/' are valid app roots (except db/).
 * 
 * @param {string} targetFile The absolute path of the file being modified.
 * @returns {string|null} The absolute path to the app root, or null if not found/invalid.
 */
export function resolveAppRoot(targetFile) {
  if (!targetFile) return null;

  try {
    let gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
    gitRoot = path.resolve(gitRoot);
    let currentDir = path.dirname(path.resolve(targetFile));

    // Handle db/ directory specially
    const relativeToGitRoot = path.relative(gitRoot, currentDir);
    if (relativeToGitRoot === 'db' || relativeToGitRoot.startsWith('db' + path.sep) || relativeToGitRoot.startsWith('db/')) {
      return path.join(gitRoot, 'db');
    }


    // Traverse upwards to find package.json
    while (currentDir.length >= gitRoot.length && currentDir.toLowerCase().startsWith(gitRoot.toLowerCase())) {
      if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        const relPath = path.relative(gitRoot, currentDir);
        const relPathPosix = relPath.split(path.sep).join('/');
        
        if (relPathPosix.startsWith('apps/') && !relPathPosix.startsWith('apps/_template')) {
          return currentDir;
        }
      }
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }
  } catch (e) {
    // If git command fails or other error
  }
  return null;
}
