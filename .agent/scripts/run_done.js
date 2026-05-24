import { execSync } from 'child_process';

const commands = [
    "node scripts/sdr_validator.js --verify",
    "npm run type-check",
    "npm run integrity",
    "node .agent/scripts/svp_check.js",
    "node .agent/scripts/reflect.js --purge",
    "node scripts/sdr_validator.js --commit",
    "node .agent/scripts/closure_gate.js --reflect"
];

function run() {
    console.log('[SEAL PROTOCOL] Starting robust sequence...');
    try {
        for (const cmd of commands) {
            console.log(`\n> Running: ${cmd}`);
            execSync(cmd, { stdio: 'inherit' });
        }
        console.log('\n[SEAL PROTOCOL] All steps completed successfully.');
    } catch (error) {
        console.error(`\n\x1b[31m[ERROR] Pipeline failed during execution. Rolling back...\x1b[0m`);
        try {
            execSync("node .agent/scripts/safe_rollback.js", { stdio: 'inherit' });
        } catch (rbError) {
            console.error(`\x1b[41m\x1b[37m[CRITICAL] Rollback also failed: ${rbError.message}\x1b[0m`);
        }
        process.exit(1);
    }
}

run();
