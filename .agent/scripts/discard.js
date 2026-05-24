import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE_PATH = path.join(__dirname, '../state/SUSPENDED_TASKS.json');

try {
    const targetBranch = process.argv[2];

    if (targetBranch) {
        // モードA: 保留中タスク（ブランチ）の破棄
        if (!fs.existsSync(STATE_FILE_PATH)) {
            console.error('[agent:discard] ❌ 保留中（退避済み）のタスクはありません。');
            process.exit(1);
        }

        let state = JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf-8'));
        const taskIndex = state.findIndex(t => t.branch === targetBranch);

        if (taskIndex === -1) {
            console.error(`[agent:discard] ❌ 指定されたブランチ '${targetBranch}' は保留リストに存在しません。`);
            process.exit(1);
        }

        console.log(`[agent:discard] 保留タスク ${targetBranch} を削除（破棄）します...`);
        
        try {
            execSync(`git branch -D ${targetBranch}`, { stdio: 'inherit' });
        } catch (e) {
            console.error(`[agent:discard] ⚠️ Gitブランチの削除中にエラーが発生しましたが、リストからの除去は継続します。`);
        }

        state.splice(taskIndex, 1);
        fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2));

        console.log(`[agent:discard] ✅ 保留タスク ${targetBranch} を破棄し、WIP枠を解放しました。`);

    } else {
        // モードB: 現在の未封印変更の破棄
        const gitStatusOutput = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
        if (gitStatusOutput.length === 0) {
            console.log('[agent:discard] 破棄する未封印の変更はありません。');
            process.exit(0);
        }

        console.log('[agent:discard] 現在の作業ツリーの変更を完全に破棄（リセット）します...');
        execSync('git reset --hard HEAD', { stdio: 'inherit' });
        
        console.log('[agent:discard] ✅ 変更をリセットしました。');
        console.log('[!] 注意: 新規追加された未追跡ファイルはそのまま残っています。不要な場合は手動で削除してください。');
        console.log('（憲法[PLEDGE]により、一括削除コマンドの自動実行は禁止されています）');
    }
} catch (error) {
    console.error('[agent:discard] ❌ 破棄処理中に致命的なエラーが発生しました:', error.message);
    process.exit(1);
}
