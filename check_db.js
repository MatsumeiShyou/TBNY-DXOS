import pg from 'pg';

const connectionString = 'postgresql://postgres.mjaoolcjjlxwstlpdgrg:tDwqo3iozPe12W4Q@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

async function checkUsers() {
    const pool = new pg.Pool({ connectionString });
    try {
        console.log('[STATE] Connecting to Supabase Remote DB...');
        const resUsers = await pool.query('SELECT id, email, encrypted_password FROM auth.users');
        console.log('[STATE] auth.users found:', resUsers.rows.length);
        resUsers.rows.forEach(user => {
            console.log(`- Email: ${user.email}, ID: ${user.id}`);
        });

        const resStaffs = await pool.query('SELECT id, name, role, auth_uid FROM staffs');
        console.log('[STATE] public.staffs found:', resStaffs.rows.length);
        resStaffs.rows.forEach(staff => {
            console.log(`- Name: ${staff.name}, Role: ${staff.role}, AuthUID: ${staff.auth_uid}`);
        });

    } catch (err) {
        console.error('[ERROR] DB Query failed:', err.message);
        if (err.message.includes('ENOTFOUND')) {
            console.log('[DECISION] Host not found. Checking if pgbouncer=true is causing issues or region is different.');
        }
    } finally {
        await pool.end();
    }
}

checkUsers();
