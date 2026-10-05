import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getProjectRoot(payload = {}, fallbackDir = __dirname) {
  const markerName = 'AGENTS.md';
  const defaultRoot = path.resolve(fallbackDir, '../../');

  if (payload && payload.workspacePaths && Array.isArray(payload.workspacePaths)) {
    for (const wsPath of payload.workspacePaths) {
      if (fs.existsSync(path.join(wsPath, markerName))) {
        return wsPath;
      }
    }
  }

  if (fs.existsSync(path.join(defaultRoot, markerName))) {
    return defaultRoot;
  }

  throw new Error(`[CRITICAL] プロジェクトルートが解決できません。マーカー (${markerName}) が見つかりません。探索パス: ${defaultRoot}`);
}

export function normalizeRelativePath(targetPath, root) {
  const resolvedTarget = path.resolve(root, targetPath);
  const relative = path.relative(root, resolvedTarget);
  return relative.replace(/\\/g, '/');
}
