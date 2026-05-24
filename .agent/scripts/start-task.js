import fs from 'fs';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';

const SESSION_DIR = path.join(process.cwd(), '.agent', 'session');
const ACTIVE_TASK_FILE = path.join(SESSION_DIR, 'active_task.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('✨ TBNY DXOS Task Initialization ✨\n');

rl.question('[1] このタスクの主な対象は何ですか？\n  1. UI/UXの変更・追加 (Route A)\n  2. システム・ロジックの変更 (Route B)\n  3. インフラ・統治・憲法の変更 (Route C)\n> ', (routeAns) => {
    let route = 'B';
    let tier = 'T2';
    
    if (routeAns.trim() === '1') {
        route = 'A';
        tier = 'T1';
    } else if (routeAns.trim() === '3') {
        route = 'C';
        tier = 'T3';
    }

    rl.question('\n[2] このタスクの危険度（リスク）を自己判定してください。\n  1. T1: 低リスク (UIのみ, 軽微)\n  2. T2: 中リスク (通常ロジック, テスト必須)\n  3. T3: 高リスク (破壊的変更, 統治変更, SDR必須)\n> ', (tierAns) => {
        if (tierAns.trim() === '1') tier = 'T1';
        if (tierAns.trim() === '2') tier = 'T2';
        if (tierAns.trim() === '3') tier = 'T3';

        rl.question('\n[3] タスクの概要を簡単に入力してください:\n> ', (descAns) => {
            if (!fs.existsSync(SESSION_DIR)) {
                fs.mkdirSync(SESSION_DIR, { recursive: true });
            }

            const activeTask = {
                active_task: {
                    id: crypto.randomUUID(),
                    route,
                    tier,
                    description: descAns.trim(),
                    started_at: new Date().toISOString()
                }
            };

            fs.writeFileSync(ACTIVE_TASK_FILE, JSON.stringify(activeTask, null, 2));

            console.log(`\n✅ タスクが開始されました！`);
            console.log(`- Tier (危険度): ${tier}`);
            console.log(`- Route (経路): Route ${route}`);
            console.log(`- 概要: ${descAns.trim()}`);
            console.log(`\n作業を開始してください。完了時は npm run request-done を実行してください。`);
            
            rl.close();
            process.exit(0);
        });
    });
});
