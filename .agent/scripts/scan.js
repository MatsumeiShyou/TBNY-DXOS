import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 憲法SSOT（グローバル）のパス
const GLOBAL_AGENTS_PATH = 'C:/Users/shiyo/開発中APP/RePaper Route/AGENTS.md';
const LOCAL_AGENTS_PATH = path.join(__dirname, '../../AGENTS.md');
const LOG_PATH = path.join(__dirname, '../logs/structure.json');

/**
 * agent:scan - 構造の観測と憲法の同期
 */
async function runScan() {
    console.log('[agent:scan] Starting project scan...');

    // タスク開始時の未完遂ブロック判定
    try {
        const patchesDir = path.join(__dirname, '../patches');
        if (fs.existsSync(patchesDir)) {
            const patchFiles = fs.readdirSync(patchesDir).filter(f => f.endsWith('.patch') || f.endsWith('.diff'));
            if (patchFiles.length > 0) {
                console.error('\n[agent:scan] ❌ ERROR: 未適用のパッチが残っています。');
                console.error('[agent:scan] 先に npm run agent:apply-patch を実行してください。\n');
                process.exit(1);
            }
        }

        const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
        if (gitStatus.length > 0) {
            console.error('\n[agent:scan] ❌ ERROR: 未封印の変更が残っています。');
            console.error('[FATAL] 未封印の変更が存在します。AIはこれ以上の推測やファイル操作を直ちに停止し、以下の選択肢をユーザーに提示して判断を仰いでください。');
            console.error('[A: 保留(stash)する / B: 完了(done)させる / C: 破棄(reset)する]\n');
            process.exit(1);
        }
    } catch (e) {
        if (e.status === 1 || process.exitCode === 1) process.exit(1);
        console.error('[agent:scan] Failed to run pre-scan interlock checks:', e.message);
        process.exit(1);
    }

    try {
        // 1. 憲法の同期（SSOTプロトコル）
        if (fs.existsSync(GLOBAL_AGENTS_PATH)) {
            const globalContent = fs.readFileSync(GLOBAL_AGENTS_PATH, 'utf-8');
            fs.writeFileSync(LOCAL_AGENTS_PATH, globalContent);
            console.log('[agent:scan] AGENTS.md synchronized with SSOT (v8.0).');
        } else {
            console.warn('[agent:scan] Global AGENTS.md not found. Using local copy.');
        }

        // 2. ディレクトリ構造の観測
        const structure = {
            timestamp: new Date().toISOString(),
            files: scanDirectory(path.join(__dirname, '../../'))
        };

        // 3. ログ出力
        if (!fs.existsSync(path.dirname(LOG_PATH))) {
            fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
        }
        fs.writeFileSync(LOG_PATH, JSON.stringify(structure, null, 2));
        console.log(`[agent:scan] Structure logged to ${LOG_PATH}`);
        
        console.log('[agent:scan] Scan complete.');
    } catch (error) {
        console.error('[agent:scan] Scan failed:', error);
        process.exit(1);
    }
}

/**
 * ディレクトリを再帰的にスキャン（node_modules, .git は除外）
 */
function scanDirectory(dir, depth = 0) {
    if (depth > 8) return []; // 深度制限を拡張 (3 -> 8)

    const items = fs.readdirSync(dir);
    const result = [];

    for (const item of items) {
        if (['node_modules', '.git', 'dist'].includes(item)) continue;

        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            result.push({
                name: item,
                type: 'dir',
                children: scanDirectory(fullPath, depth + 1)
            });
        } else {
            result.push({
                name: item,
                type: 'file',
                size: stats.size
            });
        }
    }

    return result;
}

runScan();
