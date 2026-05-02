
import pg from 'pg';
const { Pool } = pg;

async function checkUsers() {
    console.log("Connecting to Supabase (IPv4 Pooler aws-1) via explicit config...");
    const pool = new Pool({
        user: 'postgres.mjaoolcjjlxwstlpdgrg',
        password: 'tDwqo3iozPe12W4Q',
        host: 'aws-1-ap-northeast-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });
    try {
        // Simple query without placeholders to avoid prepared statements issues
        const res = await pool.query('SELECT email, encrypted_password FROM auth.users;');
        console.log("Result:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Connection error:", err.message);
    } finally {
        await pool.end();
    }
}

checkUsers();
