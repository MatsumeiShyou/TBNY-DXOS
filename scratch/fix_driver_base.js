import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchemaAndSeed() {
    console.log('--- Step 1: Fixing jobs table columns ---');
    // RPC が使えないため、直接 insert を投げて失敗させて、カラム状況を再度確認するか、
    // もしくは「あるはずのカラム」を強制的に作る SQL を実行したいが、
    // anon キーでは alter table ができないため、
    // ここでは「既存の jobs テーブルが空である」ことを利用し、
    // もしカラムがないなら、管理者側で「案件を作成」した際にどうなるかを確認する。

    // 暫定：staffs に自分を入れる（これがないと Driver アプリが null で終わる）
    const userId = '34f6c0d4-34c0-48df-a52a-5bdb8901e43b';
    console.log('--- Step 2: Seeding self as staff ---');
    
    const { error: sError } = await supabase.from('staffs').upsert({
        id: userId,
        auth_uid: userId,
        name: 'デモ管理者',
        role: 'admin',
        is_active: true
    });
    
    if (sError) {
        console.error('Staff creation failed (RLS?):', sError.message);
    } else {
        console.log('Staff created successfully.');
    }

    // [Crucial] useDriverOSBridge.ts のクエリが失敗している原因：
    // master_collection_points とのリレーション名。
    // select(`*, master_collection_points(...)`) が失敗するのは、
    // 1. jobs に master_collection_points への FK がない
    // 2. あるがリレーション名が違う
    
    // 調査用のクエリ
    console.log('--- Step 3: Verifying jobs relation ---');
    const { data: jobTest, error: jError } = await supabase
        .from('jobs')
        .select('*, master_collection_points(*)')
        .limit(1);
    
    if (jError) {
        console.error('Relation error confirmed:', jError.message);
    } else {
        console.log('Relation is OK.');
    }
}

fixSchemaAndSeed();
