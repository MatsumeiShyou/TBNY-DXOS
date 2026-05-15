
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("--- DB Schema Inspection (via SDK) ---");

    // 1. Check for 'jobs' table
    console.log("\n[1/3] 'jobs' テーブルの存在チェック中...");
    const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .limit(1);
    
    if (jobsError) {
        if (jobsError.code === '42P01') {
            console.log("結果: 'jobs' テーブルは存在しません (Table not found).");
        } else {
            console.log("結果: 'jobs' へのアクセスでエラーが発生しました:", jobsError.message);
        }
    } else {
        console.log("結果: 'jobs' テーブルは存在します。");
        console.log("カラム一覧:", jobsData?.[0] ? Object.keys(jobsData[0]) : "データが空のため列名は不明");
    }

    // 2. Check for 'routes' table structure
    console.log("\n[2/3] 'routes' テーブルの構造チェック中...");
    const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .limit(1);

    if (routesError) {
        console.log("結果: 'routes' へのアクセスでエラーが発生しました:", routesError.message);
    } else {
        console.log("結果: 'routes' テーブルは存在します。");
        const keys = routesData?.[0] ? Object.keys(routesData[0]) : [];
        console.log("カラム一覧:", keys);
        if (keys.includes('jobs')) {
            console.log("判定: 'routes' テーブルに 'jobs' カラム(JSONB)が確認されました。");
        } else {
            console.log("判定: 'routes' テーブルに 'jobs' カラムは存在しません。");
        }
    }

    console.log("\n--- 調査終了 ---");
}

check();
