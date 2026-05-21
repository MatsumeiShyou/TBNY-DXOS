import pg from 'pg';
import fs from 'fs';
import path from 'path';

// IPv4 Transaction Pooler (Port 6543)
const connectionString = 'postgresql://postgres.mjaoolcjjlxwstlpdgrg:tDwqo3iozPe12W4Q@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

async function checkDiff() {
  const client = new pg.Client({ connectionString });
  
  try {
    console.log('Connecting to remote Supabase DB via IPv4 Pooler...');
    await client.connect();
    console.log('Connected successfully.\n');

    const results = {
      jobs_fk_exists: false,
      vehicles_weight_column_exists: false,
      staffs_phone_column_exists: false,
      applied_migrations: [],
      local_migrations: []
    };

    // 1. jobs_customer_id_fkey の確認
    const fkRes = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'jobs' AND constraint_name = 'jobs_customer_id_fkey';
    `);
    results.jobs_fk_exists = fkRes.rows.length > 0;
    console.log(`[INFO] jobs_customer_id_fkey: ${results.jobs_fk_exists ? 'FOUND (リモート適用済み)' : 'NOT FOUND (リモート未適用)'}`);

    // 2. vehicles ビューの empty_vehicle_weight 列の確認
    const vColRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles' AND column_name = 'empty_vehicle_weight';
    `);
    results.vehicles_weight_column_exists = vColRes.rows.length > 0;
    console.log(`[INFO] vehicles.empty_vehicle_weight: ${results.vehicles_weight_column_exists ? 'FOUND (リモート適用済み)' : 'NOT FOUND (リモート未適用)'}`);

    // 3. staffs テーブルの phone_number 列の確認
    const sColRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'staffs' AND column_name = 'phone_number';
    `);
    results.staffs_phone_column_exists = sColRes.rows.length > 0;
    console.log(`[INFO] staffs.phone_number: ${results.staffs_phone_column_exists ? 'FOUND (リモート適用済み)' : 'NOT FOUND (リモート未適用)'}`);

    // 4. リモートDBの適用済みマイグレーション取得
    try {
      const migRes = await client.query(`
        SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;
      `);
      results.applied_migrations = migRes.rows.map(r => r.version);
      console.log('\n[INFO] Remote Applied Migrations:', results.applied_migrations);
    } catch (e) {
      console.warn('[WARN] Could not fetch schema_migrations:', e.message);
    }

    // 5. ローカルのマイグレーション一覧取得
    const migrationsDir = './supabase/migrations';
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir);
      results.local_migrations = files
        .filter(f => f.endsWith('.sql'))
        .map(f => {
          const match = f.match(/^(\d+)_/);
          return match ? match[1] : f;
        })
        .sort();
      console.log('[INFO] Local Migrations:        ', results.local_migrations);
    }

    console.log('\n--- 結論 ---');
    const missingInRemote = results.local_migrations.filter(m => !results.applied_migrations.includes(m));
    if (missingInRemote.length > 0) {
      console.log(`[!] 差異あり: リモートDBに未適用のローカルマイグレーションがあります:`, missingInRemote);
    } else {
      console.log(`[OK] マイグレーションの適用状況に差異はありません。`);
    }

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await client.end();
  }
}

checkDiff();
