import { execSync } from 'child_process';

const AGENT_MODE = process.env.AGENT_MODE === 'true';

console.log('--- 🛡️ Safe Rollback Triggered ---');
if (AGENT_MODE) {
    console.log('🤖 AI(AGENT_MODE)による自動実行を検知しました。安全のため状態を自動復元(git restore .)します。');
    try {
        execSync('git restore .', { stdio: 'inherit' });
        console.log('✅ 自動復元が完了しました。');
    } catch (e) {
        console.error('❌ 復元処理中にエラーが発生しました:', e.message);
    }
} else {
    console.error('👤 人間による手動実行を検知しました。');
    console.error('⚠️ 未保存の作業データ消失を防ぐため、自動ロールバックは行いません。');
    console.error('⚠️ エラーを修正するか、必要に応じて手動で git restore . を実行してください。');
    process.exit(1);
}
