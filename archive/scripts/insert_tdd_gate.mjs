import fs from 'fs';
let code = fs.readFileSync('.agents/scripts/closure_gate.js', 'utf8');

const tddGateCode = `
    // 機能8: Test-Driven Governance ゲート (src/変更時にテストを強制)
    if (isSrcChanged) {
        const isTestChanged = stagedFiles.some(f => f.match(/\.test\.(ts|tsx|js|jsx)$/));
        const hasT1Tag = /\[Tier:\s*T1\]/i.test(commitMsg);
        const hasBypassTag = commitMsg.includes('// bypass-tdd');
        
        if (!isTestChanged && !hasT1Tag && !hasBypassTag) {
            if (isGitHook) {
                errors.push('エラー [機能8]: src/ 配下のコードが変更されていますが、テストファイル (.test.ts等) が更新されていません。\\n  -> 解決策: T2以上のタスクでは回帰テストの追加が必須です。テストを追加するか、T1(軽微なUI修正等)であればコミットメッセージに [Tier: T1] を含めてください。');
            } else {
                errors.push('エラー [機能8]: src/ 配下のコードが変更されていますが、テストファイル (.test.ts等) が更新されていません。GSEAL発行はブロックされます。');
            }
        }
    }
`;

code = code.replace(
    /\/\/ 機能7: TS Only Gate/,
    tddGateCode + '\n\n    // 機能7: TS Only Gate'
);

fs.writeFileSync('.agents/scripts/closure_gate.js', code, 'utf8');
