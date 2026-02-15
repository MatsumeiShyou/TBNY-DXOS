import { execSync } from 'child_process';
console.log('🛫 Initiating Pre-flight Checks...');
try {
    execSync('node .agent/scripts/check_seal.js', { stdio: 'inherit' });
    console.log('✅ All systems go.');
} catch (e) {
    console.error('🔥 Pre-flight failed. Aborting.');
    process.exit(1);
}
