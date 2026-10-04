require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('daily_states').select('*').eq('date', '2026-08-25');
  console.log(JSON.stringify(data, null, 2));
}
run();
