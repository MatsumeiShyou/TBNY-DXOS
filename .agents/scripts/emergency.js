import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const reason = args.join(' ');

if (!reason) {
  console.error('❌ [エラー] 緊急回避の理由を指定してください。例: node .agents/scripts/emergency.js "本番障害対応のため"');
  process.exit(1);
}

const rootDir = process.cwd();
const bypassFile = path.join(rootDir, '.emergency-bypass');
const logFile = path.join(rootDir, '.agents', 'scratch', 'AMPLOG.jsonl');
const ledgerFile = path.join(rootDir, 'docs', 'debt_ledger.json');

// 1. Create bypass token
fs.writeFileSync(bypassFile, reason, 'utf8');

// 2. Log to AMPLOG
const logEntry = JSON.stringify({
  timestamp: new Date().toISOString(),
  event: 'EMERGENCY_BYPASS_ACTIVATED',
  reason: reason
}) + '\n';
fs.appendFileSync(logFile, logEntry, 'utf8');

// 3. Register to Debt Ledger
let ledger = { debts: [] };
if (fs.existsSync(ledgerFile)) {
  ledger = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
}
ledger.debts.push({
  id: 'EMERGENCY-' + Date.now(),
  type: 'EMERGENCY_BYPASS',
  reason: reason,
  createdAt: new Date().toISOString(),
  // Emergency has a strict 1-day deadline to fix the debt
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  resolved: false
});
fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2), 'utf8');

console.log('✅ [緊急回避] 緊急バイパスが有効になりました。次のコミットは全ての検査をスキップします。');
console.log('🚨 [警告] 負債リスト(docs/debt_ledger.json)に最高優先度のタスクが登録されました。1日以内に必ず解消してください。');
