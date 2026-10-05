import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scratchDir = path.resolve(__dirname, '../scratch');
const lockFile = path.join(scratchDir, 'ANOMALY_LOCK');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  try {
    const payload = JSON.parse(input);
    const mode = process.argv[2];

    if (mode === 'pre') {
      if (fs.existsSync(lockFile)) {
        process.stdout.write(JSON.stringify({
          decision: 'force_ask',
          reason: '🚨 [ANOMALY LOCK] 異常検知中。AIの最小実験・報告を確認し、妥当であれば [Proceed] (許可) して書き込みを進めてください。'
        }));
        return;
      }
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      return;
    }

    if (mode === 'post') {
      if (payload.error) {
        if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
        if (!fs.existsSync(lockFile)) {
          fs.writeFileSync(lockFile, `Anomaly detected. Error: ${payload.error}\n`, 'utf8');
        }
      } else if (fs.existsSync(lockFile)) {
        fs.unlinkSync(lockFile);
      }
      process.stdout.write(JSON.stringify({}));
      return;
    }

    process.stdout.write(JSON.stringify({}));
  } catch (err) {
    process.stderr.write(`[anomaly-lock] Error: ${err.message}\n`);
    process.stdout.write(JSON.stringify({}));
  }
}

main();