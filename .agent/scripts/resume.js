import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE_PATH = path.join(__dirname, '../state/SUSPENDED_TASKS.json');

try {
    // 1. 安全な再開のためのクリーンチェック
    const gitStatusOutput = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
    if (gitStatusOutput.length > 0) {
        console.error('[agent:resume] ❌ ERROR: 現在の作業ツリーに未封印の変更があるため、別のタスクを再開できません。');
        console.error('[agent:resume] 先に今の作業を完了(done)、退避(stash)、または破棄(discard)してください。');
        process.exit(1);
    }

    if (!fs.existsSync(STATE_FILE_PATH)) {
        console.log('[agent:resume] 保留中（退避済み）のタスクはありません。');
        process.exit(0);
    }

    const state = JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf-8'));
    if (state.length === 0) {
        console.log('[agent:resume] 保留中（退避済み）のタスクはありません。');
        process.exit(0);
    }

    // 引数（ブランチ名）の取得
    const targetBranch = process.argv[2];

    if (!targetBranch) {
        console.log('\n=== ⏸️ 保留中のタスク一覧 ===');
        state.forEach((task, index) => {
            console.log(`[${index + 1}] ブランチ: ${task.branch}`);
            console.log(`    退避日時: ${task.timestamp}`);
            console.log(`    変更ファイル数: ${task.files.length}`);
        });
        console.log('\n[!] タスクを再開するには、ブランチ名を引数に指定して実行してください。');
        console.log('例: npm run agent:resume task/stash-1716518100');
        process.exit(1); // 正常な案内だが、コマンド未完了のため1で終了（AIに読ませるため）
    }

    const taskExists = state.some(t => t.branch === targetBranch);
    if (!taskExists) {
        console.error(`[agent:resume] ❌ ERROR: 指定されたブランチ '${targetBranch}' は保留リストに存在しません。`);
        process.exit(1);
    }

    console.log(`[agent:resume] ブランチ ${targetBranch} を再開します...`);
    execSync(`git checkout ${targetBranch}`, { stdio: 'inherit' });
    console.log(`[agent:resume] ✅ 再開完了。作業を継続し、終わったら npm run done で封印してください。`);
} catch (error) {
    console.error('[agent:resume] ❌ 再開処理中に致命的なエラーが発生しました:', error.message);
    process.exit(1);
}
