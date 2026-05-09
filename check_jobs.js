import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
    console.log('--- Checking current staffs ---');
    const { data: staffs } = await supabase.from('staffs').select('id, name, role');
    console.log('Staffs:', staffs);

    if (staffs && staffs.length > 0) {
        const firstStaff = staffs[0];
        console.log(`\n--- Checking jobs for ${firstStaff.name} (ID: ${firstStaff.id}) ---`);
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select(`
                *,
                master_collection_points (
                    display_name
                )
            `)
            .eq('driver_id', firstStaff.id);
        
        if (error) {
            console.error('Fetch error:', error.message);
        } else {
            console.log(`Jobs count: ${jobs.length}`);
            console.log('Sample Job:', jobs[0]);
        }
    }
    
    console.log('\n--- Checking total jobs count ---');
    const { count } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
    console.log(`Total jobs in DB: ${count}`);
}

checkJobs();
