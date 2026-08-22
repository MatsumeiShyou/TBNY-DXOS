import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// コミットメッセージファイルの取得
const commitMsgFile = process.argv[2];
let commitMsg = '';

if (commitMsgFile && fs.existsSync(commitMsgFile)) {
    commitMsg = fs.readFileSync(commitMsgFile, 'utf8');
} else if (process.env.TEST_COMMIT_MSG) {
    commitMsg = process.env.TEST_COMMIT_MSG;
}

// 例外機能: // gov-bypass のチェック
if (commitMsg.includes('// gov-bypass')) {
    console.log('[BYPASS] 物理ゲート検証をスキップします。');
    process.exit(0);
}

if (!commitMsg && !process.env.TEST_MODE) {
    // 空のコミットメッセージはGit自体で弾かれることが多いが、念の為
    console.error('エラー: コミットメッセージが空です。');
    process.exit(1);
}

// 機能4: README更新漏れ防止ゲート (明示的スキップ宣言強制)
let stagedFiles = [];
try {
    const diffOutput = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    stagedFiles = diffOutput.split('\n').map(f => f.trim()).filter(Boolean);
} catch (e) {
    if (process.env.TEST_STAGED_FILES) {
        stagedFiles = process.env.TEST_STAGED_FILES.split(',');
    }
}

const isSrcChanged = stagedFiles.some(file => file.startsWith('src/'));
const srcChangedCount = stagedFiles.filter(file => file.startsWith('src/')).length;
const isReadmeChanged = stagedFiles.includes('README.md');



if (isSrcChanged && !isReadmeChanged) {
    const skipRegex = /\[README-Skip:[^\]]+\]/i;
    if (!skipRegex.test(commitMsg)) {
        console.error('エラー [機能4]: src/ 配下のコードが変更されていますが、README.md が更新されていません。');
        console.error('解決策: README.md を更新するか、コミットメッセージに [README-Skip: 理由] を含めてください。');
        process.exit(1);
    }
}

// 機能1: コミットメッセージ内に日本語が含まれているかの検証
const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
if (commitMsg && !japaneseRegex.test(commitMsg)) {
    console.error('エラー [機能1]: コミットメッセージに日本語が含まれていません。');
    process.exit(1);
}



// 機能3: T3タスク実行時におけるユーザーの承認パスワード確認機能
const isT3Task = process.env.TASK_TIER === 'T3';
if (isT3Task) {
    const approval = process.env.APPROVAL_PASSWORD;
    // 'y' または全角 'ｙ' を許可
    if (approval !== 'y' && approval !== 'ｙ') {
        console.error('エラー [機能3]: T3タスクの承認パスワード(y)が一致しません。実行を拒否します。');
        process.exit(1);
    }
}

console.log('物理強制ゲート検証合格: 矛盾はありません。');
process.exit(0);
