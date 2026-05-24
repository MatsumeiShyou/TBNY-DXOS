#!/usr/bin/env node

/**
 * svp_check.js
 * Single Version Policy (SVP) Enforcer
 * Runs `npm dedupe --dry-run` locally to check if there are unnecessary duplicates
 * without triggering network requests or false positives for unresolvable constraints.
 */

import { execSync } from 'child_process';

console.log('🔍 [SVP Check] Checking for dedupable dependencies...');

try {
    const output = execSync('npm dedupe --dry-run', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    // Check if npm reports that packages would be changed (meaning duplicates exist)
    if (output.includes('changed') && output.match(/changed \d+ packages/)) {
        console.error('❌ [SVP Violation] Dependency duplication detected that can be resolved.');
        console.error('   To fix this, run: npm dedupe');
        process.exit(1);
    } else {
        console.log('✅ [SVP Check] Passed. Dependency tree is optimally flat.');
        process.exit(0);
    }
} catch (err) {
    // If npm dedupe fails entirely (e.g. invalid package.json), fail the check
    console.error('❌ [SVP Check] Failed to run deduplication check.');
    console.error(err.message);
    process.exit(1);
}
