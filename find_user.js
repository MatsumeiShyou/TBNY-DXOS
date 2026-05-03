import pg from 'pg';

const userFormats = [
    'postgres.mjaoolcjjlxwstlpdgrg',
    'mjaoolcjjlxwstlpdgrg.postgres',
    'mjaoolcjjlxwstlpdgrg',
    'postgres'
];
const password = 'tDwqo3iozPe12W4Q';
const projectRef = 'mjaoolcjjlxwstlpdgrg';
const region = 'ap-northeast-1';

async function findUserFormat() {
    for (const user of userFormats) {
        const connectionString = `postgresql://${user}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
        const pool = new pg.Pool({ connectionString, connectionTimeoutMillis: 5000 });
        try {
            console.log(`[TEST] Testing user format: ${user}...`);
            const res = await pool.query('SELECT 1');
            if (res) {
                console.log(`[SUCCESS] Found correct user format: ${user}`);
                return user;
            }
        } catch (err) {
            console.log(`[FAIL] User format ${user} failed: ${err.message}`);
        } finally {
            await pool.end();
        }
    }
    return null;
}

findUserFormat();
