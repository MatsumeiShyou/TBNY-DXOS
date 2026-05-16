import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const REVIEW_DIR = path.join(ROOT_DIR, 'artifacts', 'review');
const COMPLETED_DIR = path.join(ROOT_DIR, 'artifacts', 'completed');
const ERROR_FILE = path.join(REVIEW_DIR, 'validation_error.md');

// Bypass check
if (process.env.BYPASS_SDR_VALIDATION === '1') {
  console.log('[SDR_VALIDATOR] Bypass mode enabled. Skipping validation.');
  process.exit(0);
}

const args = process.argv.slice(2);
const mode = args.includes('--verify') ? 'verify' : args.includes('--commit') ? 'commit' : null;

if (!mode) {
  console.error('[SDR_VALIDATOR] Error: Mode (--verify or --commit) must be specified.');
  process.exit(1);
}

const getReviewFiles = () => {
  if (!fs.existsSync(REVIEW_DIR)) return [];
  return fs.readdirSync(REVIEW_DIR).filter(f => f.endsWith('.md') && f !== 'validation_error.md');
};

if (mode === 'verify') {
  console.log('[SDR_VALIDATOR] Starting Phase 1: Verification...');
  const files = getReviewFiles();
  let hasError = false;
  let errors = [];

  if (files.length === 0) {
    console.warn('[SDR_VALIDATOR] Warning: No .md files found in review/ directory.');
  }

  for (const file of files) {
    const content = fs.readFileSync(path.join(REVIEW_DIR, file), 'utf-8');
    const missing = [];

    const patterns = [
      { name: 'State/状態', regex: /### \[(State|状態)\]|### (State|状態)/ },
      { name: 'Decision/判断', regex: /### \[(Decision|判断)\]|### (Decision|判断)/ },
      { name: 'Reason/理由', regex: /### \[(Reason|理由)\]|### (Reason|理由)/ }
    ];

    for (const p of patterns) {
      const match = content.match(p.regex);
      if (!match) {
        missing.push(p.name);
      } else {
        // Check if content exists after header
        const index = content.indexOf(match[0]);
        const nextContent = content.slice(index + match[0].length).trim();
        if (nextContent.length === 0 || nextContent.startsWith('###')) {
          missing.push(`${p.name} (本文が空です)`);
        }
      }
    }

    if (missing.length > 0) {
      hasError = true;
      errors.push({ file, missing });
    }
  }

  if (hasError) {
    const errorMsg = `### [ValidationError]
${errors.map(e => `* 対象ファイル: artifacts/review/${e.file}
* 欠落要素: ${e.missing.join(', ')}
* 状況: 必須見出しが存在しないか、本文が空です。`).join('\n\n')}

---
修正案: 記述規則に従い、State/Decision/Reason の3要素を具体的に記述してください。`;
    
    fs.writeFileSync(ERROR_FILE, errorMsg, 'utf-8');
    console.error('[SDR_VALIDATOR] Validation FAILED. Error log written to artifacts/review/validation_error.md');
    process.exit(1);
  } else {
    if (fs.existsSync(ERROR_FILE)) fs.unlinkSync(ERROR_FILE);
    console.log('[SDR_VALIDATOR] Validation PASSED.');
    process.exit(0);
  }
}

if (mode === 'commit') {
  console.log('[SDR_VALIDATOR] Starting Phase 2: Commitment...');
  const files = getReviewFiles();
  
  if (files.length === 0) {
    console.log('[SDR_VALIDATOR] Nothing to commit.');
    process.exit(0);
  }

  for (const file of files) {
    const src = path.join(REVIEW_DIR, file);
    const dest = path.join(COMPLETED_DIR, file);
    fs.renameSync(src, dest);
    console.log(`[SDR_VALIDATOR] Moved: ${file} -> artifacts/completed/`);
  }
  
  console.log('[SDR_VALIDATOR] Commitment complete.');
  process.exit(0);
}
