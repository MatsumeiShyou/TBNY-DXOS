import fs from 'fs';
let code = fs.readFileSync('.agents/scripts/done.js', 'utf8');

// Phase 0 のテスト警告を削除
code = code.replace(/if \(isSrcChanged && !testChanged\) \{[\s\S]*?warnings\+\+;\s*\}/, '');

// Compilation Gate に npm run test を追加
code = code.replace(
    /console\.log\('   -> 実行中: npm run type-check'\);/,
    `console.log('   -> 実行中: npm run test');\n    execSync('npm run test', { cwd: rootDir, stdio: 'pipe' });\n    console.log('   -> 実行中: npm run type-check');`
);

fs.writeFileSync('.agents/scripts/done.js', code, 'utf8');
