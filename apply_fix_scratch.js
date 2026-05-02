import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.mjaoolcjjlxwstlpdgrg',
  password: 'tDwqo3iozPe12W4Q',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeFix() {
  try {
    await client.connect();
    console.log('Connected to DB');

    console.log('Step 1: Adding is_active column to staffs...');
    await client.query("ALTER TABLE staffs ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true");
    await client.query("UPDATE staffs SET is_active = true WHERE is_active IS NULL");
    console.log('✅ staffs table updated.');

    console.log('Step 2: Resetting password for admin@tbny.co.jp...');
    // Use crypt from pgcrypto
    await client.query("UPDATE auth.users SET encrypted_password = crypt('tbny1234', gen_salt('bf', 10)) WHERE email = 'admin@tbny.co.jp'");
    console.log('✅ Password reset for admin@tbny.co.jp.');

    console.log('Step 3: Verification...');
    const staffRes = await client.query("SELECT email, is_active FROM staffs WHERE email = 'admin@tbny.co.jp'");
    // Note: I found earlier that 'email' might be missing in staffs, let's use auth_uid or name
    const staffRes2 = await client.query("SELECT name, is_active FROM staffs WHERE name = '管理者'");
    console.log('Staff info:', JSON.stringify(staffRes2.rows, null, 2));

  } catch (err) {
    console.error('❌ DB Execution Error:', err);
  } finally {
    await client.end();
  }
}

executeFix();
