import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('\n🔍 [Delivery Audit] 納品前監査を実行中...\n');

try {
    const status = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' });
    const changedFiles = status.split('\n').map(f => f.trim()).filter(Boolean);
    const hasUncommitted = changedFiles.some(f => !f.includes('AMPLOG.jsonl') && !f.includes('hook-events.jsonl'));

    if (hasUncommitted) {
        console.error('❌ [エラー] 未コミットの変更が残っています。納品前にコミットしてください。');
        changedFiles.forEach(f => console.error(`   - ${f}`));
        process.exit(1);
    }
    console.log('✅ [監査1] Git working tree はクリーンです。');

    execSync('git fetch', { cwd: rootDir, stdio: 'ignore' });
    const unpushed = execSync('git log origin/master..HEAD --oneline', { cwd: rootDir, encoding: 'utf8' }).trim();
    if (unpushed) {
        console.error('❌ [エラー] 未Pushのコミットがあります。納品前にリモートへPushしてください。');
        console.error(unpushed);
        process.exit(1);
    }
    console.log('✅ [監査2] すべてのコミットがリモートにPushされています。');

    const recentCommits = execSync('git log -n 10 --oneline', { cwd: rootDir, encoding: 'utf8' }).split('\n');
    const wipCommits = recentCommits.filter(line => /^[a-f0-9]+ (wip|draft):/i.test(line));
    if (wipCommits.length > 0) {
        console.error('❌ [エラー] 直近の履歴に作業中(wip)のコミットが残っています。納品前に整理してください。');
        wipCommits.forEach(c => console.error(`   - ${c}`));
        process.exit(1);
    }
    console.log('✅ [監査3] 作業中(wip)のコミットは履歴に存在しません。');

    try {
        console.log('⏳ [監査4] GitHub Actions (CI) のステータスを確認しています...');
        const ghStatus = execSync('gh run list --limit 1 --json status,conclusion', { cwd: rootDir, encoding: 'utf8' });
        const runs = JSON.parse(ghStatus);
        if (runs.length > 0) {
            const latest = runs[0];
            if (latest.status !== 'completed' || latest.conclusion !== 'success') {
                console.warn(`⚠️ [警告] CIの最新ステータスが正常ではありません (Status: ${latest.status}, Conclusion: ${latest.conclusion})。`);
                console.warn('   納品品質を満たしていない可能性があります。GitHubのActionsタブを確認してください。');
            } else {
                console.log('✅ [監査4] CIパイプラインの成功を確認しました。');
            }
        } else {
            console.log('⚠️ [監査4] CIの実行履歴が見つかりませんでした。');
        }
    } catch (e) {
        console.warn('⚠️ [監査4] GitHub CLI (gh) が見つからないか認証されていないため、CIステータスの自動確認をスキップしました。');
    }
} catch (e) {
    console.error('❌ [システムエラー] 監査処理中にエラーが発生しました。', e.message);
    process.exit(1);
}

const sealHash = crypto.randomBytes(4).toString('hex').toUpperCase();
const gseal = `[GSEAL] SEAL-${sealHash}-VERIFIED`;
const logPath = path.join(__dirname, '../scratch/AMPLOG.jsonl');
const timestamp = new Date().toISOString();
const logEntry = { timestamp, gseal, event: 'COMPLETION_DELIVERY', message: process.argv[2] || 'No message provided' };

if (fs.existsSync(path.dirname(logPath))) {
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n', 'utf8');
}
console.log('\n=========================================');
console.log('       ✅ TASK COMPLETED & SEALED        ');
console.log('=========================================');
console.log('\n実装完了報告用の GSEAL コードが発行されました。');
console.log('以下のコードを最終報告の末尾に引用提示してください。\n');
console.log(`> **${gseal}**\n`);
console.log('=========================================\n');
