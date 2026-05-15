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

async function checkFunction() {
  try {
    await client.connect();
    console.log('Connected to DB');
    
    const res = await client.query("SELECT routine_name FROM information_schema.routines WHERE routine_name = 'rpc_execute_master_update'");
    console.log('Function exists:', res.rows.length > 0);

    const colRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'staffs' AND column_name = 'is_active'");
    console.log('is_active column exists:', colRes.rows.length > 0);

  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await client.end();
  }
}

checkFunction();
