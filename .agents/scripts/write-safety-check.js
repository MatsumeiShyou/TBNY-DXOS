import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const WRITE_DANGEROUS_PATTERNS = [
  // ABS-2: シークレット検出
  { pattern: /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}/i,
    reason: 'ABS-2違反：APIキー/シークレットのハードコードの疑い' },
  { pattern: /(?:sk-|pk-|ghp_|gho_|xox[bps]-)[a-zA-Z0-9]{20,}/,
    reason: 'ABS-2違反：既知のAPIキーパターンを検出' },
  // ABS-1: ファイル内のSQL破壊コマンド
  { pattern: /DROP\s+(TABLE|DATABASE|SCHEMA)\b/i,
    reason: 'ABS-1違反：破壊的SQLのハードコード' },
  { pattern: /TRUNCATE\s+TABLE\b/i,
    reason: 'ABS-1違反：TRUNCATE文のハードコード' },
];

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  try {
    const payload = JSON.parse(input);
    const args = payload.args || {};
    const contentToCheck = args.CodeContent || args.ReplacementContent || '';
    const targetFile = args.TargetFile || 'unknown';

    // T3パスベース制約チェック (Phase 0)
    let coreConfig = { triage_rules: { T3_force_paths: [] } };
    try {
      const configStr = fs.readFileSync(path.join(rootDir, 'governance/core_config.json'), 'utf8');
      coreConfig = JSON.parse(configStr);
    } catch (e) {
      process.stderr.write(`[write-safety-check] Warning: could not load core_config.json\n`);
    }

    // バイパス判定
    if (contentToCheck.includes('// gov-bypass')) {
      console.log(JSON.stringify({ decision: "allow" }));
      process.stderr.write("[write-safety-check] Bypass tag detected. Allowed.\n");
      
      let bypassReason = "bypass tag used in content";
      const bypassMatch = contentToCheck.match(/\/\/\s*gov-bypass\s*[:：]?\s*(.+)/i);
      if (bypassMatch && bypassMatch[1]) {
          bypassReason = bypassMatch[1].trim();
      }
      
      // AMPLOGへバイパスイベントを追記
      const logEntry = {
        timestamp: new Date().toISOString(),
        event: "gov-bypass",
        tool: payload.tool || "write_to_file",
        file: targetFile,
        reason: bypassReason
      };
      const logDir = path.join(rootDir, '.agents/scratch');
      if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
      }
      fs.appendFileSync(path.join(logDir, 'AMPLOG.jsonl'), JSON.stringify(logEntry) + '\n');
      return;
    }

    const t3Paths = coreConfig.triage_rules?.T3_force_paths || [];
    const normalizedTarget = targetFile.replace(/\\/g, '/');
    const isT3Path = t3Paths.some(p => normalizedTarget.includes(p));

    if (isT3Path) {
      const reason = `T3制約違反：対象パス (${targetFile}) は強制T3ルート対象です。修正には人間の明示的承認（// gov-bypass）が必要です。`;
      console.log(JSON.stringify({ decision: "deny", reason: reason }));
      process.stderr.write(`[write-safety-check] 🚨 BLOCKED: ${reason}\n`);
      return;
    }

    for (const rule of WRITE_DANGEROUS_PATTERNS) {
      if (rule.pattern.test(contentToCheck)) {
        const result = { decision: "deny", reason: rule.reason };
        console.log(JSON.stringify(result));
        process.stderr.write(`[write-safety-check] 🚨 BLOCKED: ${rule.reason}\n`);
        return;
      }
    }

    console.log(JSON.stringify({ decision: "allow" }));
  } catch (e) {
    process.stderr.write(`[write-safety-check] Error: ${e.message}\n`);
    console.log(JSON.stringify({ decision: "deny", reason: `フック内部エラー: ${e.message}` }));
  }
}

main();
