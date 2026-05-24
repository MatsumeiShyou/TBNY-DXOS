import fs from 'fs';
import path from 'path';
import readline from 'readline';

const DEBT_FILE = path.join(process.cwd(), 'DEBT_AND_FUTURE.md');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚨 緊急デッドロック回避システム (Emergency Debt Bypass) 🚨\n');
console.log('現在の問題を「技術的負債」として登録し、一時的にゲートを通過させます。');
console.log('※指定した期限を過ぎると、すべての変更が完全にブロック（ロックダウン）されます。\n');

rl.question('[1] なぜ今すぐ修正せず、負債として回避する必要があるのですか？（理由）:\n> ', (reason) => {
    if (!reason.trim()) {
        console.error('理由は必須です。');
        process.exit(1);
    }

    rl.question('\n[2] いつまでにこの負債を完済（修正）しますか？ (YYYY-MM-DD 形式で入力):\n> ', (expiry) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(expiry.trim())) {
            console.error('期限は YYYY-MM-DD 形式で入力してください。');
            process.exit(1);
        }

        const record = `
## [EMERGENCY BYPASS] ${new Date().toISOString().split('T')[0]}
- **理由**: ${reason.trim()}
- **期限**: #expiry: ${expiry.trim()}
- **状態**: UNRESOLVED
`;

        if (!fs.existsSync(DEBT_FILE)) {
            fs.writeFileSync(DEBT_FILE, '# 技術的負債と未来への課題 (DEBT & FUTURE)\n');
        }

        fs.appendFileSync(DEBT_FILE, record);

        console.log(`\n✅ 負債を記録し、緊急回避パスを発行しました。`);
        console.log(`- 理由: ${reason.trim()}`);
        console.log(`- 期限: ${expiry.trim()} まで`);
        console.log(`期限を過ぎると closure_gate.js が完全にロックダウンします。お早めに修正してください。`);
        
        rl.close();
        process.exit(0);
    });
});
