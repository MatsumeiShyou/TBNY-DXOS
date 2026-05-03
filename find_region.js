import pg from 'pg';

const regions = ['ap-northeast-1', 'us-east-1', 'us-west-1', 'ap-southeast-1'];
const password = 'tDwqo3iozPe12W4Q';
const projectRef = 'mjaoolcjjlxwstlpdgrg';

async function findRegion() {
    for (const region of regions) {
        const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
        const pool = new pg.Pool({ connectionString, connectionTimeoutMillis: 5000 });
        try {
            console.log(`[TEST] Testing region: ${region}...`);
            const res = await pool.query('SELECT 1');
            if (res) {
                console.log(`[SUCCESS] Found correct region: ${region}`);
                return region;
            }
        } catch (err) {
            console.log(`[FAIL] Region ${region} failed: ${err.message}`);
        } finally {
            await pool.end();
        }
    }
    return null;
}

findRegion();
