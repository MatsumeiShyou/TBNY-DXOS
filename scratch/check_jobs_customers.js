import fs from 'fs';
import path from 'path';
import pg from 'pg';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Extract VITE_SUPABASE_POOLER_URL
const poolerUrlMatch = envContent.match(/VITE_SUPABASE_POOLER_URL=(.*)/);
if (!poolerUrlMatch) {
  console.error("VITE_SUPABASE_POOLER_URL not found in .env");
  process.exit(1);
}
const connectionString = poolerUrlMatch[1].trim();

console.log("Connecting to Supabase using Pooler...");
const pool = new pg.Pool({ connectionString });

try {
  const res = await pool.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('jobs', 'customers');
  `);
  console.log("Query Result (Tables Found):");
  console.log(res.rows);

  // Check details of the tables if they exist
  for (const row of res.rows) {
    const table_name = row.table_name;
    const columnsRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = $1;
    `, [table_name]);
    console.log(`\nColumns for public.${table_name}:`);
    console.log(columnsRes.rows);
  }
} catch (err) {
  console.error("Error executing query:", err);
} finally {
  await pool.end();
}
