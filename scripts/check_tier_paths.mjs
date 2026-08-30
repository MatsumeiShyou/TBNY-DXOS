import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function checkTierPaths() {
  try {
    const configPath = path.join(projectRoot, 'governance', 'core_config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('⚠️ governance/core_config.json not found. Skipping tier check.');
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const t3Paths = config.triage_rules?.T3_force_paths || [];

    if (t3Paths.length === 0) {
      return;
    }

    // Get modified files in the current git stage or working directory
    const gitDiffCmd = 'git diff --cached --name-only';
    let changedFiles = [];
    try {
      const output = execSync(gitDiffCmd, { cwd: projectRoot, encoding: 'utf8' });
      changedFiles = output.split('\n').filter(Boolean);
    } catch (e) {
      // If not a git repo or no commits yet, just skip gracefully
      return;
    }

    if (changedFiles.length === 0) {
      return;
    }

    const t3Violations = [];
    for (const file of changedFiles) {
      for (const t3Path of t3Paths) {
        // Simple prefix match or exact match depending on how t3Path is defined
        const normalizedFile = file.replace(/\\/g, '/');
        const normalizedT3Path = t3Path.replace(/\\/g, '/').replace(/\/\*+$/, '').replace(/\/$/, '');
        
        if (normalizedFile.startsWith(normalizedT3Path)) {
          t3Violations.push(normalizedFile);
          break;
        }
      }
    }

    if (t3Violations.length > 0) {
      console.error('====================================================');
      console.error('🚨 TIER 3 (STRICT) VIOLATION DETECTED 🚨');
      console.error('====================================================');
      console.error('The following changed files fall under Tier 3 rules:');
      t3Violations.forEach(f => console.error(`  - ${f}`));
      console.error('\nChanges to these paths require explicit human approval and ADR documentation.');
      console.error('Please ensure you have followed the T3 procedures defined in AGENTS.md.');
      console.error('====================================================');
      process.exit(1);
    }

    console.log('✅ Tier path check passed.');
  } catch (error) {
    console.error('Error during tier path check:', error);
    process.exit(1);
  }
}

checkTierPaths();
