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

        // タスク継続中判定
        const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
        if (currentBranch.startsWith('task/auto-')) {
            console.log(`[agent:scan] 継続中のタスクブランチ (${currentBranch}) を検知しました。スキャンを許可します。`);
        } else {
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
            if (gitStatus.length > 0) {
                console.error('\n[agent:scan] ⚠️ 未封印の変更を検知しました。');
                
                // 防壁3: Impact-Aware Lock
                const hasImpactFiles = gitStatus.split('\n').some(line => {
                    return line.includes('package.json') || line.includes('AGENTS.md') || line.includes('.agent/') || line.includes('shared/');
                });
                if (hasImpactFiles) {
                    console.error('[agent:scan] ❌ ERROR: 共通モジュール・設定ファイルが変更されています。');
                    console.error('[agent:scan] デッドロック防止のため、自動退避は禁止されています。完了(done)するか手動で破棄してください。\n');
                    process.exit(1);
                }

                // 防壁2: WIP Limit
                const branchesStr = execSync("git branch --list 'task/auto-*'", { encoding: 'utf-8' }).trim();
                const branches = branchesStr ? branchesStr.split('\n').filter(b => b.trim().length > 0) : [];
                if (branches.length >= 3) {
                    console.error('[agent:scan] ❌ ERROR: 保留中タスク(WIP)の上限(3件)に達しています。');
                    console.error('[agent:scan] ゴミ増殖防止のため、どれかを完了(done)するか破棄してから再度実行してください。\n');
                    process.exit(1);
                }

                // 防壁1: Dry-Run Confirm (CLIフレンドリー)
                const isSuspendMode = process.argv.includes('--suspend');
                if (!isSuspendMode) {
                    console.error('[agent:scan] 以下のファイルを自動退避してクリーンな空間で新規タスクを開始できます:');
                    console.error(gitStatus);
                    console.error('\n[agent:scan] ❌ ERROR: 自動退避を承認する場合は npm run agent:scan -- --suspend を実行してください。\n');
                    process.exit(1);
                }

                // 自動隔離プロトコル実行
                console.log('[agent:scan] 承認されました。未封印タスクを自動退避(隔離)します...');
                const branchName = `task/auto-${Date.now()}`;
                try {
                    execSync(`git checkout -b ${branchName}`);
                    execSync('git add .');
                    execSync('git commit -m "WIP: Auto suspended task"');
                    execSync('git checkout main');
                    console.log(`[agent:scan] ✓ タスクを ${branchName} に隔離し、main環境をクリーンにしました。`);
                    
                    // DEBTへの自動記帳
                    const debtPath = path.join(__dirname, '../../DEBT_AND_FUTURE.md');
                    if (fs.existsSync(debtPath)) {
                        let debtContent = fs.readFileSync(debtPath, 'utf-8');
                        const entry = `- [ ] **[SUSPENDED]** Branch: \`${branchName}\` - ${new Date().toISOString()}`;
                        debtContent = debtContent.replace('## ⏸️ 保留中・未封印タスク (Suspended Tasks)', `## ⏸️ 保留中・未封印タスク (Suspended Tasks)\n${entry}`);
                        fs.writeFileSync(debtPath, debtContent);
                        console.log(`[agent:scan] ✓ DEBT_AND_FUTURE.md に保留記録を追加しました。`);
                    }
                } catch (err) {
                    console.error('[agent:scan] ❌ ERROR: 自動隔離中にGitエラーが発生しました。', err.message);
                    process.exit(1);
                }
            }
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
