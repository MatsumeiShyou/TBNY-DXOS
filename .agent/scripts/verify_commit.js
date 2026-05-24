import fs from 'fs';
import { execSync } from 'child_process';

const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
    process.exit(0);
}

try {
    const commitMsg = fs.readFileSync(commitMsgFile, 'utf8');

    // Check if bypass tags exist
    if (/\[minor\]|\[typo\]/.test(commitMsg)) {
        console.log("⏭️  [Bypass] 軽微な修正タグを検知したため、ADR確認をスキップします。");
        process.exit(0);
    }

    // Check for modified governance files
    const diffOutput = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    const changedFiles = diffOutput.split('\n').filter(Boolean);

    const govChanged = changedFiles.some(file => file.startsWith('governance/'));

    if (govChanged) {
        // Check if ADR or AMPLOG is added/modified
        const recordAdded = changedFiles.some(file => file.startsWith('governance/ADR/') || file === 'AMPLOG.jsonl');
        
        if (!recordAdded) {
            console.error("❌ [Error] governance/ 配下のルールが変更されていますが、ADRやAMPLOGの記録がありません！");
            console.error("💡 修正が些細な場合は、コミットメッセージに [minor] または [typo] を含めてください。");
            console.error("💡 重要な変更の場合は、記録用の専用コマンド（ワークフロー）を使用して決定事項を残してください。");
            process.exit(1);
        }
    }
} catch (e) {
    console.error("❌ [Error] コミットメッセージの検証中にエラーが発生しました:", e.message);
    process.exit(1);
}
