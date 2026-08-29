/**
 * 002_migrate_master_data.mjs
 * 
 * master.json のローカルデータを Supabase の3層マスタ構造に移行するスクリプト
 * 
 * 実行方法: node scripts/002_migrate_master_data.mjs
 * 
 * 処理順序:
 *   1. master_items     (品目)
 *   2. master_workers    (作業員)
 *   3. master_vehicles   (車両)
 *   4. master_payers     (支払先 - 重複排除)
 *   5. master_contractors(仕入先 - 重複排除、payer紐付け)
 *   6. master_collection_points(回収先 - contractor紐付け)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ .env に VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定されていません');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// master.json を読み込み
const masterPath = resolve(__dirname, '..', 'public', 'data', 'master.json');
const master = JSON.parse(readFileSync(masterPath, 'utf8'));

// ============================================
// ユーティリティ
// ============================================
let totalInserted = 0;
let totalSkipped = 0;
let totalErrors = 0;

async function upsertBatch(tableName, rows, conflictColumn) {
  if (rows.length === 0) {
    console.log(`  ⏭  ${tableName}: 0件（スキップ）`);
    return [];
  }

  const { data, error } = await supabase
    .from(tableName)
    .upsert(rows, { onConflict: conflictColumn, ignoreDuplicates: true })
    .select();

  if (error) {
    console.error(`  ❌ ${tableName} エラー:`, error.message);
    totalErrors += rows.length;
    return [];
  }

  const inserted = data?.length || 0;
  const skipped = rows.length - inserted;
  totalInserted += inserted;
  totalSkipped += skipped;
  console.log(`  ✅ ${tableName}: ${inserted}件挿入, ${skipped}件スキップ（既存）`);
  return data || [];
}

// ============================================
// Step 1: 品目マスタ
// ============================================
async function migrateItems() {
  console.log('\n📦 Step 1: 品目マスタ (master_items)');

  // master.json の items にはコードが入っていない場合がある
  // customers.items[] に入っている品目コードも収集する
  const itemCodesFromCustomers = new Set();
  for (const c of master.customers) {
    if (c.items) {
      c.items.forEach(code => itemCodesFromCustomers.add(code));
    }
  }

  const rows = (master.items || []).map((item, idx) => ({
    item_code: item.id || `item_${idx}`,
    name: item.name || `品目${idx}`,
  }));

  // customers から参照されているがitems配列に定義がないコードも追加
  for (const code of itemCodesFromCustomers) {
    if (!rows.find(r => r.item_code === code)) {
      rows.push({ item_code: code, name: `品目コード:${code}` });
    }
  }

  return await upsertBatch('master_items', rows, 'item_code');
}

// ============================================
// Step 2: 作業員マスタ
// ============================================
async function migrateWorkers() {
  console.log('\n👷 Step 2: 作業員マスタ (master_workers)');

  // 既存データを確認
  const { data: existing } = await supabase.from('master_workers').select('name');
  const existingNames = new Set((existing || []).map(e => e.name));

  const rows = master.workers
    .filter(w => !existingNames.has(w.name))
    .map(w => ({
      name: w.name,
      role_label: w.kana || null,
      can_drive: w.is_active !== false,
      can_collect: true,
      is_active: w.is_active !== false,
    }));

  if (rows.length === 0) {
    console.log(`  ⏭  master_workers: 0件（全て既存）`);
    return;
  }

  const { data, error } = await supabase.from('master_workers').insert(rows).select();
  if (error) {
    console.error(`  ❌ master_workers エラー:`, error.message);
    totalErrors += rows.length;
  } else {
    totalInserted += data.length;
    console.log(`  ✅ master_workers: ${data.length}件挿入`);
  }
  return data || [];
}

// ============================================
// Step 3: 車両マスタ
// ============================================
async function migrateVehicles() {
  console.log('\n🚛 Step 3: 車両マスタ (master_vehicles)');

  const rows = master.vehicles.map(v => ({
    vehicle_no: v.name || v.id,
    capacity_kg: v.max_capacity_kg || 0,
    is_active: true,
  }));

  return await upsertBatch('master_vehicles', rows, 'vehicle_no');
}

// ============================================
// Step 4: 支払先マスタ（重複排除）
// ============================================
async function migratePayers() {
  console.log('\n💰 Step 4: 支払先マスタ (master_payers)');

  const payerMap = new Map();
  for (const c of master.customers) {
    if (c.payeeCode && !payerMap.has(c.payeeCode)) {
      payerMap.set(c.payeeCode, {
        payee_code: c.payeeCode,
        name: c.payeeName || c.payeeCode,
      });
    }
  }

  const rows = Array.from(payerMap.values());
  return await upsertBatch('master_payers', rows, 'payee_code');
}

// ============================================
// Step 5: 仕入先マスタ（重複排除、payer紐付け）
// ============================================
async function migrateContractors(payersInDb) {
  console.log('\n🏢 Step 5: 仕入先マスタ (master_contractors)');

  // DB上のpayerをコードでルックアップ
  const payerLookup = {};
  for (const p of payersInDb) {
    payerLookup[p.payee_code] = p.id;
  }

  const contractorMap = new Map();
  for (const c of master.customers) {
    if (c.supplierCode && !contractorMap.has(c.supplierCode)) {
      contractorMap.set(c.supplierCode, {
        contractor_code: c.supplierCode,
        payer_id: payerLookup[c.payeeCode] || null,
        name: c.supplierName || c.supplierCode,
      });
    }
  }

  const rows = Array.from(contractorMap.values());
  return await upsertBatch('master_contractors', rows, 'contractor_code');
}

// ============================================
// Step 6: 回収先マスタ（contractor紐付け）
// ============================================
async function migrateCollectionPoints(contractorsInDb) {
  console.log('\n📍 Step 6: 回収先マスタ (master_collection_points)');

  // DB上のcontractorをコードでルックアップ
  const contractorLookup = {};
  for (const c of contractorsInDb) {
    contractorLookup[c.contractor_code] = c.id;
  }

  const rows = master.customers.map(c => ({
    contractor_id: contractorLookup[c.supplierCode] || null,
    name: c.name || c.supplierName || '名称不明',
    address: c.address || null,
    target_item_codes: c.items || [],
    time_pattern: 'FREE',
    vehicle_lock: !!c.requiredVehicle,
    schedule_rules: c.scheduleRules || { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
    holiday_collection: c.holidayCollection || false,
    default_duration: c.defaultDuration || 30,
    note: c.note || null,
    is_active: c.isInvalid !== true,
  }));

  // 既存データチェック
  const { data: existing } = await supabase.from('master_collection_points').select('name');
  if (existing && existing.length > 0) {
    console.log(`  ⚠️  master_collection_points に既に ${existing.length}件のデータがあります。重複投入を防ぐためスキップします。`);
    console.log(`  💡 再投入する場合はダッシュボードで既存データを削除してから再実行してください。`);
    totalSkipped += rows.length;
    return;
  }

  const { data, error } = await supabase.from('master_collection_points').insert(rows).select();
  if (error) {
    console.error(`  ❌ master_collection_points エラー:`, error.message);
    totalErrors += rows.length;
  } else {
    totalInserted += data.length;
    console.log(`  ✅ master_collection_points: ${data.length}件挿入`);
  }
}

// ============================================
// メイン実行
// ============================================
async function main() {
  console.log('========================================');
  console.log('RePaperRoute データ移行スクリプト');
  console.log(`ソース: ${masterPath}`);
  console.log(`ターゲット: ${SUPABASE_URL}`);
  console.log('========================================');

  // Step 1-3: 独立マスタ（並列実行可能だが安全のため順次）
  await migrateItems();
  await migrateWorkers();
  await migrateVehicles();

  // Step 4: 支払先（回収先の親の親）
  const payersInDb = await migratePayers();

  // payersInDb が空の場合、DBから再取得（upsert で ignoreDuplicates の場合 data が空になり得る）
  let payers = payersInDb;
  if (payers.length === 0) {
    const { data } = await supabase.from('master_payers').select('*');
    payers = data || [];
  }

  // Step 5: 仕入先（支払先のID参照が必要）
  const contractorsInDb = await migrateContractors(payers);

  let contractors = contractorsInDb;
  if (contractors.length === 0) {
    const { data } = await supabase.from('master_contractors').select('*');
    contractors = data || [];
  }

  // Step 6: 回収先（仕入先のID参照が必要）
  await migrateCollectionPoints(contractors);

  // サマリー
  console.log('\n========================================');
  console.log('📊 移行結果サマリー');
  console.log(`  挿入: ${totalInserted}件`);
  console.log(`  スキップ（既存）: ${totalSkipped}件`);
  console.log(`  エラー: ${totalErrors}件`);
  console.log('========================================');

  if (totalErrors > 0) {
    console.log('\n⚠️  エラーが発生しました。上記のエラーメッセージを確認してください。');
    process.exit(1);
  } else {
    console.log('\n✅ データ移行が正常に完了しました！');
  }
}

main().catch(err => {
  console.error('❌ 予期しないエラー:', err);
  process.exit(1);
});
