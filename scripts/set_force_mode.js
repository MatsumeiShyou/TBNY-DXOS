/**
 * AGENTS.md Section A: 物理強制の有効・無効を制御するスクリプト
 * 
 * Usage: node scripts/set_force_mode.js [--rule <rule_name>] [--enable|--disable] [--all]
 * 
 * 変更時は AMPLOG.jsonl に自動記録される。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '../governance/core_config.json');
const AMPLOG_PATH = path.join(__dirname, '../AMPLOG.jsonl');

const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
  console.log(`
Usage: node scripts/set_force_mode.js [options]

Options:
  --rule <name>   Target a specific rule (e.g., F-SSOT, SVP)
  --enable        Enable the rule/all rules
  --disable       Disable the rule/all rules  
  --all           Apply to all rules
  --help          Show this help

Examples:
  node scripts/set_force_mode.js --all --enable
  node scripts/set_force_mode.js --rule F-SSOT --disable
`);
  process.exit(0);
}

try {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const ruleName = args.includes('--rule') ? args[args.indexOf('--rule') + 1] : null;
  const enable = args.includes('--enable');
  const disable = args.includes('--disable');
  const all = args.includes('--all');

  if (!enable && !disable) {
    console.error('Error: --enable or --disable is required');
    process.exit(1);
  }

  const newValue = enable;
  const changes = [];

  if (all) {
    if (!config.force_rules) config.force_rules = {};
    config.force_mode = newValue;
    changes.push({ target: 'FORCE_MODE', value: newValue });
  } else if (ruleName) {
    if (!config.force_rules) config.force_rules = {};
    config.force_rules[ruleName] = newValue;
    changes.push({ target: `FORCE_RULE_${ruleName}`, value: newValue });
  } else {
    console.error('Error: --rule <name> or --all is required');
    process.exit(1);
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');

  // AMPLOG に記録
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: 'set_force_mode',
    changes,
    source: 'scripts/set_force_mode.js'
  };
  fs.appendFileSync(AMPLOG_PATH, JSON.stringify(logEntry) + '\n', 'utf8');

  console.log('Force mode updated:', JSON.stringify(changes, null, 2));
} catch (e) {
  console.error('Failed to update force mode:', e.message);
  process.exit(1);
}
