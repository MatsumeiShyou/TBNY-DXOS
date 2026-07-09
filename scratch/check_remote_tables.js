import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.mjaoolcjjlxwstlpdgrg:tDwqo3iozPe12W4Q@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    await client.connect();
    console.log('Connected successfully via pg Pooler!');

    // Query 1: All tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\\n--- Remote Tables in public Schema ---');
    tablesRes.rows.forEach(row => console.log(`- \${row.table_name}`));

    // Query 2: Specifically check for jobs and customers columns
    for (const tableName of ['jobs', 'customers']) {
      const colRes = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      console.log(`\\n--- Table: \${tableName} (Columns count: \${colRes.rows.length}) ---`);
      if (colRes.rows.length > 0) {
        colRes.rows.forEach(col => {
          console.log(`  * \${col.column_name} (\${col.data_type}, nullable: \${col.is_nullable})`);
        });
      } else {
        console.log(`  Table "\${tableName}" does not exist or has no columns.`);
      }
    }

  } catch (err) {
    console.error('Database connection or query failed:', err);
  } finally {
    await client.end();
  }
}

main();
