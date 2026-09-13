import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const commitMsgFile = process.argv[2];
let commitMsg = '';
if (commitMsgFile && fs.existsSync(commitMsgFile)) {
    commitMsg = fs.readFileSync(commitMsgFile, 'utf8');
} else if (process.env.TEST_COMMIT_MSG) {
    commitMsg = process.env.TEST_COMMIT_MSG;
}

if (commitMsg.includes('// gov-bypass')) {
    console.log('[BYPASS] 物理強制ゲートをスキップします。');
    process.exit(0);
}

if (!commitMsg) {
    console.error('エラー: コミットメッセージが空です。');
    process.exit(1);
}

let stagedFiles = [];
try {
    const diffOutput = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    stagedFiles = diffOutput.split('\n').map(f => f.trim()).filter(Boolean);
} catch (e) {
    if (process.env.TEST_STAGED_FILES) {
        stagedFiles = process.env.TEST_STAGED_FILES.split(',');
    }
}

const projectRoot = process.cwd();
const configPath = path.join(projectRoot, 'governance', 'core_config.json');
let t3Paths = [];
if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    t3Paths = config.triage_rules?.T3_force_paths || [];
}

const hasT3Changes = stagedFiles.some(file => {
    return t3Paths.some(t3 => {
        const normalizedFile = file.replace(/\\/g, '/');
        const normalizedT3Path = t3.replace(/\\/g, '/').replace(/\/\*+$/, '').replace(/\/$/, '');
        return normalizedFile.startsWith(normalizedT3Path);
    });
});

const lowerMsg = commitMsg.trim().toLowerCase();
const isWip = lowerMsg.startsWith('wip:') || lowerMsg.startsWith('draft:');
const isStrictMode = !isWip || hasT3Changes;

if (!isStrictMode) {
    console.log('🚧 [WIP Mode] T3パス変更なし。軽量チェックを実行します...');
    try {
        console.log(' -> 実行中: npm run lint');
        execSync('npm run lint', { stdio: 'inherit' });
        console.log('✅ 軽量チェック完了');
        process.exit(0);
    } catch (e) {
        console.error('❌ [エラー] Lintに失敗しました。');
        process.exit(1);
    }
} else {
    console.log('🛡️ [Strict Mode] 本番品質ゲートを実行します...');
    if (isWip && hasT3Changes) {
        console.log('⚠️ [警告] wip: プレフィックスですが、T3パスが変更されているためStrict Modeを強制します。');
    }
    try {
        console.log(' -> 実行中: npm run lint');
        execSync('npm run lint', { stdio: 'inherit' });
        console.log(' -> 実行中: npm run type-check');
        execSync('npm run type-check', { stdio: 'inherit' });
        console.log(' -> 実行中: npm run test');
        execSync('npm run test', { stdio: 'inherit' });
        
        const isSrcChanged = stagedFiles.some(file => file.startsWith('src/'));
        const isReadmeChanged = stagedFiles.includes('README.md');
        if (isSrcChanged && !isReadmeChanged) {
            const skipRegex = /\[README-Skip:[^\]]+\]/i;
            if (!skipRegex.test(commitMsg)) {
                console.error('❌ エラー [機能4]: src/ 配下のコードが変更されていますが、README.md が更新されていません。');
                console.error('解決策: README.md を更新するか、コミットメッセージに [README-Skip: 理由] を含めてください。');
                process.exit(1);
            }
        }
        const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
        if (!japaneseRegex.test(commitMsg)) {
            console.error('❌ エラー [機能1]: コミットメッセージに日本語が含まれていません。');
            process.exit(1);
        }
        console.log('✅ 厳格チェック完了。コミットを許可します。');
        process.exit(0);
    } catch (e) {
        console.error('❌ [エラー] Strict Modeの検証に失敗しました。コミットは中断されます。');
        process.exit(1);
    }
}
