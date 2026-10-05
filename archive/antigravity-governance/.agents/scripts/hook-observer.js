import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const logPath = path.join(rootDir, '.agents/scratch/hook-events.jsonl');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
    input += chunk;
});

process.stdin.on('end', () => {
    try {
        const payload = JSON.parse(input);
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: "hook_observed",
            tool: payload.tool || 'unknown',
            // サブエージェントの検証用にコンテキスト情報を記録
            isSubagent: !!payload.context?.conversation_id,
            conversation_id: payload.context?.conversation_id || 'parent',
            argsSummary: Object.keys(payload.args || {})
        };
        
        const logDir = path.dirname(logPath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    } catch (e) {
        // 例外発生時も必ず握り潰し、エージェントの処理を阻害しない（シャドーモードの絶対要件）
        console.error('[Hook Observer Error]', e.message);
    }
    
    // AntigravityのPreToolUse契約に基づき、常に許可（allow）を標準出力に返す
    console.log(JSON.stringify({ decision: "allow" }));
    process.exit(0);
});
