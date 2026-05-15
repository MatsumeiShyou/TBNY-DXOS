import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkItems() {
    console.log('--- Checking master_items ---');
    try {
        const { data, error, count } = await supabase
            .from('master_items')
            .select('*', { count: 'exact' });

        if (error) {
            console.error('Error fetching master_items:', error);
        } else {
            console.log(`Count: ${count}`);
            console.log('Sample Data:', data?.slice(0, 2));
        }
    } catch (e) {
        console.error('Unexpected error checkItems:', e);
    }

    console.log('\n--- Checking master_collection_points ---');
    try {
        const { data: points, error: pError, count: pCount } = await supabase
            .from('master_collection_points')
            .select('*', { count: 'exact' });

        if (pError) {
            console.error('Error fetching master_collection_points:', pError);
        } else {
            console.log(`Count: ${pCount}`);
            console.log('Sample Data:', points?.slice(0, 2));
        }
    } catch (e) {
        console.error('Unexpected error checkPoints:', e);
    }
}

checkItems();
