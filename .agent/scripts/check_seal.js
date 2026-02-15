import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    const ampLogPath = path.resolve(__dirname, '../../AMPLOG.md');
    if (!fs.existsSync(ampLogPath)) process.exit(1);

    const content = fs.readFileSync(ampLogPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const lastLine = lines[lines.length - 1];

    if (!lastLine.includes('承認 (PW: ｙ)')) {
        console.error('❌ Seal verification failed. Approval required.');
        process.exit(1);
    }
    console.log('✅ Seal verified.');
    process.exit(0);
} catch (e) {
    process.exit(1);
}
