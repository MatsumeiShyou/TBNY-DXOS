import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || 'http://localhost:54321', process.env.VITE_SUPABASE_ANON_KEY || 'dummy');

async function test() {
    try {
        const { data, error } = await supabase.from('master_collection_points').select('target_item_codes').contains('target_item_codes', ['item-1']).limit(1);
        console.log(error || data);
    } catch(e) { console.log(e); }
}
test();
