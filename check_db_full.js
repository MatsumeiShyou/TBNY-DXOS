import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
    const tables = ['master_items', 'master_collection_points', 'master_vehicles', 'vehicles', 'drivers'];
    for (const table of tables) {
        console.log(`\n--- Checking ${table} ---`);
        const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' });
        if (error) {
            console.error(`Error ${table}:`, error.message);
        } else {
            console.log(`Count: ${count}`);
            console.log('Sample Data (Keys):', data?.[0] ? Object.keys(data[0]) : 'NONE');
        }
    }
}

checkAll();
