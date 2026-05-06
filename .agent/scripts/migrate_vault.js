import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'fs';
import path, { join } from 'path';

const Log = {
    info: (msg) => console.log(`[MIGRATE] ${msg}`),
    success: (msg) => console.log(`[MIGRATE] ✓ ${msg}`),
    error: (msg) => console.error(`[MIGRATE] ❌ ${msg}`)
};

function migrateWalkthrough() {
    const walkthroughPath = join(process.cwd(), 'walkthrough.md');
    const vaultEvidencesDir = join(process.cwd(), 'governance', 'vault', 'evidences');
    const vaultMediaDir = join(process.cwd(), 'governance', 'vault', 'media');
    const indexPath = join(process.cwd(), 'governance', 'vault', 'audit_index.jsonl');

    if (!existsSync(walkthroughPath)) {
        Log.error('walkthrough.md not found. Skipping migration.');
        return;
    }

    if (!existsSync(vaultEvidencesDir)) mkdirSync(vaultEvidencesDir, { recursive: true });
    if (!existsSync(vaultMediaDir)) mkdirSync(vaultMediaDir, { recursive: true });

    let wtContent = readFileSync(walkthroughPath, 'utf8');

    // Remove old SEAL banners and specific headers
    let contentForVault = wtContent
        .replace(/# \[TASK_CLOSED\]/g, '')
        .replace(/\[GATE-SEAL: GSEAL-[\w-]+\]/g, '')
        .replace(/> \[!IMPORTANT\]\n> \*\*\*\*\n/g, '')
        .replace(/> \[!IMPORTANT\]\n> \n/g, '')
        .trim();

    if (!contentForVault) {
        Log.info('walkthrough.md is already clean or empty.');
        return;
    }

    const legacyCode = 'GSEAL-LEGACY-MIGRATION';
    const destEvidencePath = join(vaultEvidencesDir, `${legacyCode}.md`);

    writeFileSync(destEvidencePath, contentForVault);
    Log.success(`Legacy evidence vaulted: ${legacyCode}.md`);

    const indexEntry = {
        seal: legacyCode,
        timestamp: new Date().toISOString(),
        file: `governance/vault/evidences/${legacyCode}.md`,
        summary: "Legacy walkthrough.md migration archive."
    };
    appendFileSync(indexPath, JSON.stringify(indexEntry) + '\n');
    Log.success('Audit index updated.');

    // Clear walkthrough.md
    const newWtContent = `# [TASK_CLOSED]\n\n## [${legacyCode}] ${new Date().toISOString().split('T')[0]}\n\n> 過去の履歴は \`governance/vault/evidences/${legacyCode}.md\` にアーカイブされました。\n\n> [!IMPORTANT]\n> **[GATE-SEAL: ${legacyCode}]**\n`;
    writeFileSync(walkthroughPath, newWtContent);
    Log.success('walkthrough.md rotated to fresh state.');
}

migrateWalkthrough();
