const fs = require('fs');
const path = require('path');

try {
    const input = fs.readFileSync(0, 'utf-8');
    const request = JSON.parse(input);
    const toolName = request.toolCall.name;
    const args = request.toolCall.arguments;
    const cwd = process.cwd();

    const restrictedTools = [
        'default_api:view_file', 
        'default_api:write_to_file', 
        'default_api:replace_file_content'
    ];

    if (restrictedTools.includes(toolName)) {
        let targetPath = null;
        if (args.AbsolutePath) targetPath = args.AbsolutePath;
        if (args.TargetFile) targetPath = args.TargetFile;

        if (targetPath) {
            const resolvedTarget = path.resolve(targetPath).toLowerCase();
            const resolvedCwd = path.resolve(cwd).toLowerCase();

            // Cwd外へのアクセスを禁止する
            if (!resolvedTarget.startsWith(resolvedCwd)) {
                // Denyを標準出力に返して終了
                console.log(JSON.stringify({
                    error: `[System Hard Stop] Cwd (${cwd}) 外へのアクセスは禁止されています。推測でのファイル検索を直ちに停止し、「どの領域の作業ですか？」とユーザーに質問してください。`
                }));
                process.exit(0);
            }
        }
    }
    
    // 問題ない場合は空または許可を出力
    console.log(JSON.stringify({}));
} catch (e) {
    // 実行エラー時はフォールバックとして許可
    console.log(JSON.stringify({}));
}
