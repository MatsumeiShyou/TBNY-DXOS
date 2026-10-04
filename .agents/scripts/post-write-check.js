import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) { input += chunk; }

  try {
    const payload = JSON.parse(input);
    const targetFile = payload?.toolCall?.args?.TargetFile || payload?.args?.TargetFile;

    if (!targetFile || !targetFile.match(/\.(js|jsx|ts|tsx)$/) || !fs.existsSync(targetFile)) {
      process.stdout.write('{}');
      return;
    }

    let errorMessages = [];

    // 1. ESLint Check
    try {
      const eslintPath = path.join(rootDir, 'node_modules', '.bin', 'eslint');
      if (fs.existsSync(eslintPath)) {
        execSync(`"${eslintPath}" "${targetFile}"`, { cwd: rootDir, encoding: 'utf8', timeout: 8000 });
      }
    } catch (err) {
      if (err.stdout || err.stderr) {
        errorMessages.push(`[ESLint Error in ${path.basename(targetFile)}]\n${(err.stdout || '').substring(0, 500)}`);
      }
    }

    // 2. TypeScript Check
    if (targetFile.match(/\.(ts|tsx)$/)) {
      try {
        const tscPath = path.join(rootDir, 'node_modules', '.bin', 'tsc');
        if (fs.existsSync(tscPath)) {
          execSync(`"${tscPath}" --noEmit`, { cwd: rootDir, encoding: 'utf8', timeout: 15000 });
        }
      } catch (err) {
         if (err.stdout || err.stderr) {
            errorMessages.push(`[TypeScript Error]\n${(err.stdout || err.stderr || '').substring(0, 1000)}`);
         }
      }
    }

    if (errorMessages.length > 0) {
      process.stderr.write(`[post-write-check] ⚠️ Verification Failed:\n\n${errorMessages.join('\n\n')}\n`);
      process.exit(1);
    } else {
      process.stderr.write(`[post-write-check] ✅ Verification Passed for ${path.basename(targetFile)}\n`);
      process.stdout.write('{}');
    }
  } catch (err) {
    process.stderr.write(`[post-write-check] 🚨 Fatal hook error: ${err.message}\n`);
    process.stdout.write('{}');
  }
}

main();
