import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

export function checkClosure(options = {}) {
    const {
        commitMsg = '',
        isT3Task = process.env.TASK_TIER === 'T3',
        approvalPassword = process.env.APPROVAL_PASSWORD,
        isGitHook = false
    } = options;

    const errors = [];
    const warnings = [];

    // 例外機能: // gov-bypass のチェック
    if (commitMsg.includes('// gov-bypass')) {
        return { success: true, bypassed: true, errors, warnings };
    }

    if (isGitHook && !commitMsg && !process.env.TEST_MODE) {
        errors.push('エラー: コミットメッセージが空です。');
    }

    // 機能4: README更新漏れ防止ゲート
    let stagedFiles = [];
    try {
        const diffOutput = execSync('git diff --cached --name-only', { encoding: 'utf8' });
        stagedFiles = diffOutput.split('\n').map(f => f.trim()).filter(Boolean);
    } catch (e) {
        if (process.env.TEST_STAGED_FILES) {
            stagedFiles = process.env.TEST_STAGED_FILES.split(',');
        }
    }

    const isSrcChanged = stagedFiles.some(file => file.startsWith('src/'));
    const isReadmeChanged = stagedFiles.includes('README.md');

    if (isSrcChanged && !isReadmeChanged) {
        const skipRegex = /\[README-Skip:[^\]]+\]/i;
        if (!skipRegex.test(commitMsg)) {
            if (isGitHook) {
                errors.push('エラー [機能4]: src/ 配下のコードが変更されていますが、README.md が更新されていません。解決策: README.md を更新するか、コミットメッセージに [README-Skip: 理由] を含めてください。');
            } else {
                warnings.push('⚠️ [機能4]: src/ 配下のコードがステージされていますが、README.md が更新されていません。');
            }
        }
    }

    // 機能5: MDU制限ゲート (src/ への巨大な一括変更をブロック)
    const srcFiles = stagedFiles.filter(f => f.startsWith('src/'));
    if (srcFiles.length >= 4 && !commitMsg.includes('// bypass-mdu')) {
        if (isGitHook) {
            errors.push('エラー [機能5]: 1回のタスクで src/ 配下のファイルが4つ以上変更されています（MDU違反）。タスクを分割するか、コミットメッセージに // bypass-mdu を含めてください。');
        } else {
            warnings.push('⚠️ [機能5]: 4つ以上の src/ ファイルが変更されています。MDU（最小分散化ユニット）の原則に違反している可能性があります。');
        }
    }

    // 機能6: メタ・ガバナンス・ゲート (AGENTS.md 変更時の判定強制)
    const isAgentsMdChanged = stagedFiles.includes('AGENTS.md');
    if (isAgentsMdChanged) {
        const hasTriageTag = /\[Triage:\s*(Hard|Soft)(?:\s*-\s*[^\]]+)?\]/i.test(commitMsg);
        if (!hasTriageTag) {
            if (isGitHook) {
                errors.push('エラー [機能6]: AGENTS.md が変更されましたが、物理強制化の判定タグがありません。コミットメッセージに [Triage: Hard] または [Triage: Soft - 理由] を追記し、ルールの物理判定プロセスを証明してください。');
            } else {
                warnings.push('⚠️ [機能6]: AGENTS.md が変更されています。完了報告のGSEALと共に、必ず [Triage: Hard] または [Triage: Soft - 理由] の判定を明記してください。');
            }
        }
    }

    // 機能7: TS Only Gate (src/ 配下への .js / .jsx の追加・変更をブロック)
    const jsFiles = stagedFiles.filter(f => f.startsWith('src/') && (f.endsWith('.js') || f.endsWith('.jsx')));
    if (jsFiles.length > 0) {
        errors.push(`エラー [機能7]: src/ 配下への .js / .jsx ファイルの追加・変更は固く禁じられています（TS移行完了のため）。\n該当ファイル: ${jsFiles.join(', ')}`);
    }

    // 機能1: コミットメッセージ内に日本語が含まれているかの検証
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    if (isGitHook && commitMsg && !japaneseRegex.test(commitMsg)) {
        errors.push('エラー [機能1]: コミットメッセージに日本語が含まれていません。');
    }

    // 機能3: T3タスク実行時におけるユーザーの承認パスワード確認機能
    if (isT3Task) {
        if (approvalPassword !== 'y' && approvalPassword !== 'ｙ') {
            errors.push('エラー [機能3]: T3タスクの承認パスワード(y)が一致しません。実行を拒否します。');
        }
    }

    return {
        success: errors.length === 0,
        bypassed: false,
        errors,
        warnings
    };
}

// CLIとして直接実行された場合（Gitフック想定）
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
    const commitMsgFile = process.argv[2];
    let commitMsg = '';
    if (commitMsgFile && fs.existsSync(commitMsgFile)) {
        commitMsg = fs.readFileSync(commitMsgFile, 'utf8');
    } else if (process.env.TEST_COMMIT_MSG) {
        commitMsg = process.env.TEST_COMMIT_MSG;
    }

    const result = checkClosure({ commitMsg, isGitHook: true });
    
    if (result.bypassed) {
        console.log('[BYPASS] 物理ゲート検証をスキップします。');
        process.exit(0);
    }

    if (!result.success) {
        result.errors.forEach(e => console.error(e));
        process.exit(1);
    }

    console.log('物理強制ゲート検証合格: 矛盾はありません。');
    process.exit(0);
}
