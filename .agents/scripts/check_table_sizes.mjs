import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSizes() {
  console.log("Checking row counts for major tables using Service Role Key...");
  const tables = [
    'event_logs', 
    'daily_jobs', 
    'actuals', 
    'master_collection_points', 
    'master_contractors', 
    'master_payers',
    'master_resource_availability'
  ];
  
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`Error fetching ${table}:`, JSON.stringify(error, null, 2));
    } else {
      console.log(`- ${table}: ${count} rows`);
    }
  }
}

checkSizes();
