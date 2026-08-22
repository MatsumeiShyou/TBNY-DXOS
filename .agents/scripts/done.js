import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

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

// 監査結果サマリー
if (warnings > 0) {
    console.log(`⚠️  監査完了: ${warnings} 件の警告があります。上記を確認してください。`);
    console.log('   ※ 警告はGSEAL発行をブロックしません（強制ブロックはclosure_gate.jsの責務です）。\n');
}


// ランダムなGSEALコードの生成
const sealHash = crypto.randomBytes(4).toString('hex').toUpperCase();
const gseal = `SEAL-${sealHash}-VERIFIED`;

console.log('=========================================');
console.log('       ✅ TASK COMPLETED & SEALED        ');
console.log('=========================================');
console.log(`\n実装完了報告用の GSEAL コードが発行されました。`);
console.log(`以下のコードを最終報告（SDRフォーマット等）の末尾に引用提示してください。\n`);
console.log(`> **[GSEAL] ${gseal}**`);
console.log('\n=========================================\n');
