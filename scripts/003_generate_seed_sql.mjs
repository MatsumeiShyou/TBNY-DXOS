/**
 * 003_generate_seed_sql.mjs
 * master.json からデータ投入用SQLを生成するスクリプト
 * 実行方法: node scripts/003_generate_seed_sql.mjs
 * 生成物: scripts/003_seed_master_data.sql (ダッシュボードSQL Editorに貼り付けて実行)
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const masterPath = resolve(__dirname, '..', 'public', 'data', 'master.json');
const outputPath = resolve(__dirname, '003_seed_master_data.sql');

const master = JSON.parse(readFileSync(masterPath, 'utf8'));
const lines = [];

function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// ======= 品目マスタ =======
lines.push('-- ========== 品目マスタ ==========');
const itemCodesFromCustomers = new Set();
master.customers.forEach(c => (c.items || []).forEach(code => itemCodesFromCustomers.add(code)));

const allItems = (master.items || []).map(item => ({ code: item.id, name: item.name }));
for (const code of itemCodesFromCustomers) {
  if (!allItems.find(r => r.code === code)) {
    allItems.push({ code, name: `コード:${code}` });
  }
}
for (const item of allItems) {
  lines.push(`INSERT INTO master_items (item_code, name) VALUES (${esc(item.code)}, ${esc(item.name)}) ON CONFLICT (item_code) DO NOTHING;`);
}

// ======= 作業員マスタ =======
lines.push('');
lines.push('-- ========== 作業員マスタ ==========');
for (const w of master.workers) {
  const kana = w.kana ? esc(w.kana) : 'NULL';
  const active = w.is_active !== false;
  lines.push(`INSERT INTO master_workers (name, role_label, can_drive, can_collect, is_active) VALUES (${esc(w.name)}, ${kana}, ${active}, true, ${active});`);
}

// ======= 車両マスタ =======
lines.push('');
lines.push('-- ========== 車両マスタ ==========');
for (const v of master.vehicles) {
  const no = v.name || v.id || '';
  const cap = v.max_capacity_kg || 0;
  lines.push(`INSERT INTO master_vehicles (vehicle_no, capacity_kg) VALUES (${esc(no)}, ${cap}) ON CONFLICT (vehicle_no) DO NOTHING;`);
}

// ======= 支払先マスタ (重複排除) =======
lines.push('');
lines.push('-- ========== 支払先マスタ ==========');
const payerMap = new Map();
master.customers.forEach(c => {
  if (c.payeeCode && !payerMap.has(c.payeeCode)) {
    payerMap.set(c.payeeCode, c.payeeName || c.payeeCode);
  }
});
for (const [code, name] of payerMap) {
  lines.push(`INSERT INTO master_payers (payee_code, name) VALUES (${esc(code)}, ${esc(name)}) ON CONFLICT (payee_code) DO NOTHING;`);
}

// ======= 仕入先マスタ (重複排除、payer紐付け) =======
lines.push('');
lines.push('-- ========== 仕入先マスタ ==========');
const contractorMap = new Map();
master.customers.forEach(c => {
  if (c.supplierCode && !contractorMap.has(c.supplierCode)) {
    contractorMap.set(c.supplierCode, {
      name: c.supplierName || c.supplierCode,
      payeeCode: c.payeeCode,
    });
  }
});
for (const [code, val] of contractorMap) {
  lines.push(`INSERT INTO master_contractors (contractor_code, payer_id, name) VALUES (${esc(code)}, (SELECT id FROM master_payers WHERE payee_code = ${esc(val.payeeCode)}), ${esc(val.name)}) ON CONFLICT (contractor_code) DO NOTHING;`);
}

// ======= 回収先マスタ =======
lines.push('');
lines.push('-- ========== 回収先マスタ ==========');
for (const c of master.customers) {
  const name = c.name || c.supplierName || '名称不明';
  const addr = c.address || null;
  const items = `{${(c.items || []).join(',')}}`;
  const sc = c.supplierCode || '';
  const sr = JSON.stringify(c.scheduleRules || { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] });
  const hc = c.holidayCollection || false;
  const dd = c.defaultDuration || 30;
  const note = c.note || null;
  const active = c.isInvalid !== true;
  const vl = !!c.requiredVehicle;

  lines.push(`INSERT INTO master_collection_points (contractor_id, name, address, target_item_codes, schedule_rules, holiday_collection, default_duration, note, is_active, vehicle_lock) VALUES ((SELECT id FROM master_contractors WHERE contractor_code = ${esc(sc)}), ${esc(name)}, ${addr ? esc(addr) : 'NULL'}, ${esc(items)}, ${esc(sr)}::jsonb, ${hc}, ${dd}, ${note ? esc(note) : 'NULL'}, ${active}, ${vl});`);
}

writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log(`✅ SQLファイルを生成しました: ${outputPath}`);
console.log(`   品目: ${allItems.length}件`);
console.log(`   作業員: ${master.workers.length}件`);
console.log(`   車両: ${master.vehicles.length}件`);
console.log(`   支払先: ${payerMap.size}件`);
console.log(`   仕入先: ${contractorMap.size}件`);
console.log(`   回収先: ${master.customers.length}件`);
console.log(`   合計: ${lines.filter(l => l.startsWith('INSERT')).length}件のINSERT文`);
