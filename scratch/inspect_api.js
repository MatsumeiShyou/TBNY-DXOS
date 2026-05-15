import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('--- Checking table accessibility ---');
    const tables = ['staffs', 'drivers', 'jobs', 'master_collection_points', 'master_vehicles', 'vehicles'];
    for (const t of tables) {
        const { error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`[${t}] ERROR: ${error.code} - ${error.message}`);
        } else {
            console.log(`[${t}] OK`);
        }
    }

    console.log('\n--- Checking jobs table columns ---');
    const { data: jobSample } = await supabase.from('jobs').select('*').limit(1);
    console.log('Jobs columns:', jobSample?.[0] ? Object.keys(jobSample[0]) : 'NO DATA (CANNOT INFER COLUMNS)');

    // もしデータが 0 件なら RPC や metadata から情報を取るのは難しいため、
    // ここでは「アクセスできるか」に絞る。
}

inspectSchema();
