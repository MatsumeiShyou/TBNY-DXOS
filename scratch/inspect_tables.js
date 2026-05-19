import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('--- Inspecting tables ---');
  
  // jobs テーブルの全カラム情報を間接的に取得するため、空データを挿入しようとしてエラーからスキーマを推測するか、
  // もしくはAPIから返されるメタデータ（あるいはエラー詳細）を確認
  const { data: jobs, error: jError } = await supabase.from('jobs').select('*').limit(1);
  console.log('Jobs check:', { data: jobs, error: jError?.message });

  // customers テーブルが存在するか確認するため、1件取得してみる
  const { data: customers, error: cError } = await supabase.from('customers').select('*').limit(1);
  console.log('Customers check:', { hasTable: !cError, error: cError?.message });

  // master_collection_points テーブルが存在するか確認
  const { data: points, error: pError } = await supabase.from('master_collection_points').select('*').limit(1);
  console.log('MasterCollectionPoints check:', { hasTable: !pError, error: pError?.message });
}

inspectSchema();
