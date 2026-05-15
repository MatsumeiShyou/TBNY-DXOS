import pg from 'pg';

const connectionString = 'postgresql://postgres:tDwqo3iozPe12W4Q@db.mjaoolcjjlxwstlpdgrg.supabase.co:6543/postgres?pgbouncer=true';

async function checkPooler() {
    const pool = new pg.Pool({ connectionString, connectionTimeoutMillis: 5000 });
    try {
        console.log('[TEST] Testing pooler on db.mjaoolcjjlxwstlpdgrg.supabase.co:6543...');
        const res = await pool.query('SELECT 1');
        if (res) {
            console.log('[SUCCESS] Connected to pooler!');
        }
    } catch (err) {
        console.log(`[FAIL] Pooler failed: ${err.message}`);
    } finally {
        await pool.end();
    }
}

checkPooler();
