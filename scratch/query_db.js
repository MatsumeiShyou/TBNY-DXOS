import pg from 'pg';

const connectionString = "postgresql://postgres.mjaoolcjjlxwstlpdgrg:tDwqo3iozPe12W4Q@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function main() {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    // テーブルの存在確認
    const resTables = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('jobs', 'customers');
    `);
    console.log("=== Tables ===");
    console.log(JSON.stringify(resTables.rows, null, 2));

    // テーブル定義カラムの確認
    const resColumns = await client.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('jobs', 'customers')
      ORDER BY table_name, ordinal_position;
    `);
    console.log("=== Columns ===");
    console.log(JSON.stringify(resColumns.rows, null, 2));

    // 外部キー制約の確認
    const resConstraints = await client.query(`
      SELECT 
          tc.constraint_name,
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = ccu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public'
        AND (tc.table_name = 'jobs' OR tc.table_name = 'customers');
    `);
    console.log("=== Foreign Keys ===");
    console.log(JSON.stringify(resConstraints.rows, null, 2));
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
