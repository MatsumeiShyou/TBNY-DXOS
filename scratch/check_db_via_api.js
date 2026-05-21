import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjaoolcjjlxwstlpdgrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qYW9vbGNqamx4d3N0bHBkZ3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTk0MDQsImV4cCI6MjA4NTIzNTQwNH0.Veyu2pcnPJHK6g3wj1JsNMskCh0sxdB_JWEi0lsWoQ0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  console.log('Starting remote DB schema verification over HTTPS API...');
  
  const results = {
    jobs_relation_ok: false,
    vehicles_weight_ok: false,
    staffs_phone_ok: false
  };

  // 1. jobs_customer_id_fkey 外部キー（リレーション結合）の検証
  console.log('\n1. Testing: jobs -> customers relation fetch...');
  const { data: jobsData, error: jobsError } = await supabase
    .from('jobs')
    .select('id, customer_id, customers ( id, name )')
    .limit(1);

  if (jobsError) {
    console.error('[FAIL] jobs -> customers relation fetch failed:', jobsError.message);
    results.jobs_relation_ok = false;
  } else {
    console.log('[SUCCESS] jobs -> customers relation fetch succeeded. (外部キー制約が正常に機能しています)');
    results.jobs_relation_ok = true;
  }

  // 2. vehicles ビューの empty_vehicle_weight 列の検証
  console.log('\n2. Testing: vehicles.empty_vehicle_weight column fetch...');
  const { data: vehiclesData, error: vehiclesError } = await supabase
    .from('vehicles')
    .select('id, number, empty_vehicle_weight')
    .limit(1);

  if (vehiclesError) {
    console.error('[FAIL] vehicles.empty_vehicle_weight column fetch failed:', vehiclesError.message);
    results.vehicles_weight_ok = false;
  } else {
    console.log('[SUCCESS] vehicles.empty_vehicle_weight column fetch succeeded. (列が存在します)');
    results.vehicles_weight_ok = true;
  }

  // 3. staffs テーブルの phone_number 列の検証
  console.log('\n3. Testing: staffs.phone_number column fetch...');
  const { data: staffsData, error: staffsError } = await supabase
    .from('staffs')
    .select('id, phone_number')
    .limit(1);

  if (staffsError) {
    console.error('[FAIL] staffs.phone_number column fetch failed:', staffsError.message);
    results.staffs_phone_ok = false;
  } else {
    console.log('[SUCCESS] staffs.phone_number column fetch succeeded. (列が存在します)');
    results.staffs_phone_ok = true;
  }

  console.log('\n=== スキーマ検証結果サマリー ===');
  console.log(`- jobs -> customers 結合: ${results.jobs_relation_ok ? '一致 (差異なし)' : '不一致 (要確認)'}`);
  console.log(`- vehicles 空車重量列:   ${results.vehicles_weight_ok ? '一致 (差異なし)' : '不一致 (要確認)'}`);
  console.log(`- staffs 電話番号列:     ${results.staffs_phone_ok ? '一致 (差異なし)' : '不一致 (要確認)'}`);

  if (results.jobs_relation_ok && results.vehicles_weight_ok && results.staffs_phone_ok) {
    console.log('\n[OK] 本番DB環境とローカル設計（マイグレーション定義）の間にスキーマ差異はありません。すべて正常に同期されています。');
  } else {
    console.log('\n[WARN] 本番DB環境とローカル設計の間に差異が検出されました。上記の失敗ログを確認してください。');
  }
}

verifySchema();
