
import pg from 'pg';
const connectionString = 'postgresql://postgres.mjaoolcjjlxwstlpdgrg:tDwqo3iozPe12W4Q@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new pg.Pool({ connectionString });

async function check() {
  try {
    const res = await pool.query('SELECT count(*) FROM staffs');
    console.log('Staff count:', res.rows[0].count);
    
    const indexes = await pool.query("SELECT indexdef FROM pg_indexes WHERE tablename = 'staffs'");
    console.log('Indexes:', JSON.stringify(indexes.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
check();
