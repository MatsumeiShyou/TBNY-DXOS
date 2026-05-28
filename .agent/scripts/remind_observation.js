import chalk from 'chalk';

const TARGET_DATE = new Date('2026-05-28T13:06:33+09:00');
const currentDate = new Date();

if (currentDate > TARGET_DATE) {
  console.log('\n');
  console.log(chalk.bgRed.white.bold(' ======================================================== '));
  console.log(chalk.bgRed.white.bold(' 🚨 [ANNOUNCEMENT] 運用観測期間（5分間）が終了しました！ 🚨 '));
  console.log(chalk.bgRed.white.bold(' ======================================================== '));
  console.log(chalk.yellow(' ▶ 現在の FORCE_MODE=error が安定稼働している場合、例外回避の'));
  console.log(chalk.yellow('    手段を廃止し、完全な物理強制（ハードロック）への移行を検討'));
  console.log(chalk.yellow('    してください。'));
  console.log(chalk.yellow(' ▶ Legacy Debt (既存の例外リスト等) の解消を進めましょう。'));
  console.log(chalk.cyan.bold('\n 💬 [会話再開方法]'));
  console.log(chalk.cyan('    AIエージェントに以下のIDを伝えてコンテキストを復帰させてください:'));
  console.log(chalk.cyan.bold('    Conversation ID: @e336fc29-b60f-41c5-8815-19b0a5217e48'));
  console.log(chalk.bgRed.white.bold(' ======================================================== '));
  console.log('\n');
  
  // 5秒間一時停止して確実に読ませる
  setTimeout(() => {}, 5000);
}
