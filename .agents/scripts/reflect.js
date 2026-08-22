import { execSync } from 'child_process';

const args = process.argv.slice(2);
const isPurge = args.includes('--purge');

console.log('🔍 Sanctuary Purge (reflect.js) を開始します...');

try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (!status) {
        console.log('✅ ワーキングツリーはクリーンです。');
        process.exit(0);
    }

    console.log('⚠️ 以下の変更または未追跡ファイルが検出されました：');
    console.log(status);

    if (isPurge) {
        console.log('\n[警告] 一括削除（git clean -fdX 等）は AGENTS.md により永久禁止されています。');
        console.log('不要なファイルが存在する場合は、エージェント自身または手動で個別に削除を行ってください。');
        
        const untracked = status.split('\n').filter(line => line.startsWith('??'));
        if (untracked.length > 0) {
            console.log('\n未追跡ファイルが存在するため、コミット漏れがないか確認してください。');
        }
    } else {
        console.log('\n※ `--purge` オプションをつけて実行すると、パージ用の警告が表示されます。');
    }
} catch (error) {
    console.error('Git コマンドの実行に失敗しました:', error.message);
}
