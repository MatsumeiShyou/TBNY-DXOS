import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { checkClosure } from './closure_gate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('\n🔍 [Post-Execution Audit] 完了前監査を実行中...\n');

let warnings = 0;

// [1] dist/ の存在確認（npm run build が実行されたか）
const distDir = path.join(rootDir, 'dist');
const distHtml = path.join(distDir, 'index.html');
if (!fs.existsSync(distDir) || !fs.existsSync(distHtml)) {
    console.warn('⚠️ [監査1] dist/index.html が存在しません。npm run build が実行されていない可能性があります。');
    warnings++;
} else {
    const distStat = fs.statSync(distHtml);
    const ageMinutes = (Date.now() - distStat.mtimeMs) / 1000 / 60;
    if (ageMinutes > 60) {
        console.warn(`⚠️ [監査1] dist/ の最終更新は ${Math.round(ageMinutes)} 分前です。最新のビルドを実行してください。`);
        warnings++;
    } else {
        console.log('✅ [監査1] dist/ は最新です（ビルド済み）。');
    }
}

// [2] src/ が変更されているのに README.md が未変更なら警告
try {
    const status = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' });
    const changedFiles = status.split('\n').map(f => f.trim()).filter(Boolean);
    const srcChanged = changedFiles.some(f => f.includes('src/'));
    const readmeChanged = changedFiles.some(f => f.includes('README.md'));

    if (srcChanged && !readmeChanged) {
        console.warn('⚠️ [監査2] src/ が変更されていますが、README.md が更新されていません。');
        console.warn('   → [SSOT Sync Protocol] に従い、README.md を確認・更新してください。');
        console.warn('   → 不要な場合はコミットメッセージに [README-Skip: 理由] を含めてください。');
        warnings++;
    } else if (srcChanged && readmeChanged) {
        console.log('✅ [監査2] src/ と README.md の両方が変更されています（SSOT同期済み）。');
    } else {
        console.log('✅ [監査2] src/ に変更はありません（README確認不要）。');
    }

    // [3.5] Phase 0: ガバナンス制約の簡易チェック (テストとワークログ)
    const testChanged = changedFiles.some(f => f.match(/\.test\.(ts|tsx|js|jsx)$/));
    const worklogChanged = changedFiles.some(f => f.includes('.agents/scratch/worklog.md'));
    const isSrcChanged = changedFiles.some(f => f.startsWith('src/'));

    if (isSrcChanged && !testChanged) {
        console.warn('⚠️  [監査] (Phase 0) ソースが変更されていますが、テストファイル (.test.ts等) が更新されていません。');
        console.warn('   -> T2 (標準) ルートで修正を行った場合、回帰テストの追加が必須です。ルール違反の可能性があります。');
        warnings++;
    }
    if (isSrcChanged && !worklogChanged) {
        console.warn('⚠️  [監査] (Phase 0) ソースが変更されていますが、worklog.md が更新されていません。');
        console.warn('   -> T1 (軽微) ルートであっても、1行ログとDiffリンクの最小トレースが必要です。');
        warnings++;
    }

    // [3] 未コミット変更の警告
    if (changedFiles.length > 0) {
        console.warn(`⚠️ [監査3] ${changedFiles.length} 件の未コミット変更があります。`);
        warnings++;
    } else {
        console.log('✅ [監査3] ワーキングツリーはクリーンです。');
    }
} catch (e) {
    console.warn('⚠️ [監査2/3] Git コマンドの実行に失敗しました。スキップします。');
}

// [4] DEBT_AND_FUTURE.md の存在確認
const debtPath = path.join(rootDir, 'DEBT_AND_FUTURE.md');
if (!fs.existsSync(debtPath)) {
    console.warn('⚠️ [監査4] DEBT_AND_FUTURE.md が存在しません。未対応事項の記録先がありません。');
    warnings++;
} else {
    console.log('✅ [監査4] DEBT_AND_FUTURE.md は存在します。');
}

console.log('');

// [5] closure_gate.js の物理ゲート呼び出し
const closureResult = checkClosure({ isGitHook: false });
if (closureResult.warnings.length > 0) {
    closureResult.warnings.forEach(w => console.warn(w));
    warnings += closureResult.warnings.length;
}
if (!closureResult.success) {
    console.error('\n🚨 [重大な違反] closure_gate の物理的検証に失敗しました。以下のエラーを解消してください：');
    closureResult.errors.forEach(e => console.error(e));
    console.error('\n❌ GSEALの発行は物理的にブロックされました。');
    process.exit(1);
}

// [5.1] Compilation Gate: ビルド/型チェックの強制実行
console.log('\n🔨 [Compilation Gate] ビルドと型チェックの強制検証を実行中...');
try {
    // TSインフラが導入されたため、型チェックとビルドの双方を強制確認
    console.log('   -> 実行中: npm run type-check');
    execSync('npm run type-check', { cwd: rootDir, stdio: 'pipe' });
    
    console.log('   -> 実行中: npm run build');
    execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });
    
    console.log('✅ [Compilation Gate] 検証合格。エラーはありません。');
} catch (e) {
    console.error('\n🚨 [重大な違反] ビルドまたは型チェックに失敗しました。');
    console.error(e.stdout ? e.stdout.toString() : e.message);
    console.error(e.stderr ? e.stderr.toString() : '');
    console.error('\n❌ エラーを残したままのタスク完了（GSEAL発行）は物理的にブロックされました。');
    process.exit(1);
}

// [5.5] AMPLOG.jsonl の gov-bypass カウント
try {
    const amplogData = fs.readFileSync(path.join(rootDir, '.agents/scratch/AMPLOG.jsonl'), 'utf8');
    const bypassCount = amplogData.split('\n').filter(line => line.includes('"event":"gov-bypass"')).length;
    if (bypassCount >= 3) {
        console.warn(`⚠️ [警告] 過去に ${bypassCount} 回の gov-bypass が使用されています。統治の迂回が常態化していないか確認してください。`);
        warnings++;
    }
} catch (e) {
    // 存在しない場合は無視
}

// 監査結果サマリー
if (warnings > 0) {
    console.log(`⚠️  監査完了: ${warnings} 件の警告があります。上記を確認してください。`);
}

// ランダムなGSEALコードの生成
const sealHash = crypto.randomBytes(4).toString('hex').toUpperCase();
const gseal = `SEAL-${sealHash}-VERIFIED`;

// AMPLOGへの書き込み
const amplogDir = path.join(rootDir, '.agents/scratch');
const amplogPath = path.join(amplogDir, 'AMPLOG.jsonl');
if (!fs.existsSync(amplogDir)) {
    fs.mkdirSync(amplogDir, { recursive: true });
}
const logEntry = {
    timestamp: new Date().toISOString(),
    event: "seal",
    gseal: gseal,
    warnings: warnings
};
fs.appendFileSync(amplogPath, JSON.stringify(logEntry) + '\n');

console.log('=========================================');
console.log('       ✅ TASK COMPLETED & SEALED        ');
console.log('=========================================');
console.log(`\n実装完了報告用の GSEAL コードが発行されました。`);
console.log(`以下のコードを最終報告（SDRフォーマット等）の末尾に引用提示してください。\n`);
console.log(`> **[GSEAL] ${gseal}**`);
console.log('\n=========================================\n');
