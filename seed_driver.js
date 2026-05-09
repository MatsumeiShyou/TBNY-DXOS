import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    const userId = '34f6c0d4-34c0-48df-a52a-5bdb8901e43b';
    const pointId = '0bab563a-21e6-41fe-a28c-9576f5222458';

    console.log('--- Seeding staffs ---');
    const { data: staff, error: sError } = await supabase
        .from('staffs')
        .upsert({
            id: userId,
            name: 'デモ管理者',
            role: 'admin',
            auth_uid: userId,
            is_active: true,
            allowed_apps: ["repaper-route-admin", "repaper-route-driver", "master-data"]
        })
        .select();
    
    if (sError) console.error('Staff error:', sError.message);
    else console.log('Staff created:', staff);

    console.log('\n--- Seeding jobs ---');
    // jobs テーブルのカラム名が不明なため、一般的なものを推測して試行
    const { data: job, error: jError } = await supabase
        .from('jobs')
        .upsert({
            driver_id: userId,
            customer_name: 'テスト案件',
            location_id: pointId,
            status: 'pending',
            start_time: new Date().toISOString()
        })
        .select();

    if (jError) {
        console.error('Job error (first try):', jError.message);
        // カラム名が location_id ではなく master_collection_point_id かもしれない
        console.log('Retrying with master_collection_point_id...');
        const { error: jError2 } = await supabase
            .from('jobs')
            .upsert({
                driver_id: userId,
                customer_name: 'テスト案件',
                master_collection_point_id: pointId,
                status: 'pending',
                start_time: new Date().toISOString()
            });
        if (jError2) console.error('Job error (second try):', jError2.message);
    } else {
        console.log('Job created:', job);
    }
}

seedData();
