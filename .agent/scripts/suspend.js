import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE_PATH = path.join(__dirname, '../state/SUSPENDED_TASKS.json');
const MAX_WIP = 3;

// 影響範囲ブロック対象
const RESTRICTED_FILES = [
    'package.json',
    'package-lock.json',
    'AGENTS.md',
    '.agent/',
    'shared/',
    'governance/'
];

function isRestricted(filePath) {
    return RESTRICTED_FILES.some(restricted => filePath.startsWith(restricted) || filePath === restricted);
}

try {
    const gitStatusOutput = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
    if (gitStatusOutput.length === 0) {
        console.log('[agent:stash] 退避する未封印の変更はありません。');
        process.exit(0);
    }

    const changedFiles = gitStatusOutput.split('\n').map(line => line.substring(3).trim());
    const restrictedMatches = changedFiles.filter(isRestricted);

    if (restrictedMatches.length > 0) {
        console.error('[FATAL] 以下の共通/重要ファイルが変更されているため、保留（退避）は物理的に禁止されています:');
        restrictedMatches.forEach(f => console.error(`  - ${f}`));
        console.error('デッドロックを防ぐため、今の作業を完了(done)させるか、破棄(reset)してください。');
        process.exit(1);
    }

    if (!fs.existsSync(path.dirname(STATE_FILE_PATH))) {
        fs.mkdirSync(path.dirname(STATE_FILE_PATH), { recursive: true });
    }

    let state = [];
    if (fs.existsSync(STATE_FILE_PATH)) {
        state = JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf-8'));
    }

    if (state.length >= MAX_WIP) {
        console.error(`[FATAL] 保留枠が上限（${MAX_WIP}つ）に達しています。どれかを完済(done)するか破棄(discard)してください。`);
        process.exit(1);
    }

    const timestamp = Date.now();
    const branchName = `task/stash-${timestamp}`;

    console.log(`[agent:stash] 未封印の変更を ${branchName} に退避します...`);
    
    // Git退避シーケンス
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "WIP: Auto-stashed changes on ${new Date().toISOString()}"`, { stdio: 'inherit' });
    execSync('git checkout main', { stdio: 'inherit' });

    state.push({
        branch: branchName,
        timestamp: new Date().toISOString(),
        files: changedFiles
    });

    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2));

    console.log(`[agent:stash] ✅ 退避完了。現在の作業ツリーはクリーンな main ブランチに戻りました。`);
} catch (error) {
    console.error('[agent:stash] ❌ 退避処理中に致命的なエラーが発生しました:', error.message);
    process.exit(1);
}
