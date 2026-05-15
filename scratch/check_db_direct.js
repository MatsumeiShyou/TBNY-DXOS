import pg from 'pg';

const connectionString = 'postgresql://postgres:tDwqo3iozPe12W4Q@db.mjaoolcjjlxwstlpdgrg.supabase.co:5432/postgres';

async function checkUsers() {
    const pool = new pg.Pool({ connectionString });
    try {
        console.log('[STATE] Connecting to Supabase Remote DB (Direct 5432)...');
        const resUsers = await pool.query('SELECT id, email FROM auth.users');
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
    } finally {
        await pool.end();
    }
}

checkUsers();
