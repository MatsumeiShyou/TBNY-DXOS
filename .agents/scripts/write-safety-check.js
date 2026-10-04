import fs from 'fs';
import path from 'path';

async function main() {
  let input = '';
  for await (const chunk of process.stdin) { input += chunk; }

  try {
    const payload = JSON.parse(input);
    const targetFile = payload?.toolCall?.args?.TargetFile || payload?.args?.TargetFile;
    if (!targetFile) {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      return;
    }

    // 1. Tier A (絶対凍結領域): AI自身による統治機構の改ざんを物理的に拒否 (Grokの原則)
    const normalizedPath = targetFile.replace(/\\/g, '/');
    if (normalizedPath.includes('/.agents/') || normalizedPath.includes('/governance/')) {
      process.stdout.write(JSON.stringify({
        decision: 'deny',
        reason: '【AI統治機構の自己改ざん防止】 .agents/ および governance/ 配下のファイルはAIによる書き込みが物理的に禁止されています。変更が必要な場合は人間が直接編集してください。'
      }));
      return;
    }

    // 2. core_config.json の読み込み (フェイルクローズ化)
    // 今回のメタ評価に基づき、複雑な判定は出口に寄せ、入り口の関所はシンプルに保つ。
    
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  } catch (err) {
    // 致命的エラー時はフェイルクローズ（Grok/Claude合意）
    process.stdout.write(JSON.stringify({ 
      decision: 'deny', 
      reason: 'write-safety-check内部で致命的エラーが発生しました。フェイルクローズ原則により書き込みを遮断します。' 
    }));
  }
}

main();
