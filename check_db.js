import pg from 'pg';

// ユーザー名を postgres 単体で試行
const connectionString = 'postgresql://postgres:tDwqo3iozPe12W4Q@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

async function checkUsers() {
    const pool = new pg.Pool({ connectionString });
    try {
        console.log('[STATE] Connecting to Supabase Remote DB (Pooler/Simple User)...');
        const resUsers = await pool.query('SELECT email FROM auth.users');
        console.log('[STATE] SUCCESS! Users found:', resUsers.rows.length);
        resUsers.rows.forEach(user => {
            console.log(`- Email: ${user.email}`);
        });
    } catch (err) {
        console.error('[ERROR] DB Query failed:', err.message);
    } finally {
        await pool.end();
    }
}

checkUsers();
