# SCHEMA_HISTORY.md — DB スキーマ変更履歴

> AGENTS.md [SQL Sync] に基づき、スキーマ変更を記録する。

---

## 2026-05-19 — Driver App Crash Resolution
*   対象ファイル: `supabase/migrations/20260519000000_add_jobs_customer_fk.sql`

### 1. `jobs` テーブルに `customers` への物理外部キー制約を追加
```sql
ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_customer_id_fkey" 
    FOREIGN KEY ("customer_id") 
    REFERENCES "public"."customers"("id") 
    ON DELETE SET NULL;
```
**理由**: [useDriverOSBridge.ts](file:///C:/Users/shiyo/開発中APP/TBNY%20DXOS/src/features/repaper-route/driver/bridge/useDriverOSBridge.ts) 内で `jobs` と `customers` をネスト結合フェッチしているが、データベース上に物理的な外部キーが存在しないため PostgREST API が `PGRST200` エラーを返してクラッシュしていた。このスキーマ制約の追加により、データが0件であってもエラーにならず、正常に「0件」として動作する。
（※ローカル環境の DNS 閉塞および IPv6 制限ネットワークにより、エージェントによる自動適用は制限されたため、Supabase Dashboard SQL Editor 経由での手動実行が必要）

---

## 2026-05-15 — Governance Engine Rev.3

### 1. `vehicles` ビュー更新
```sql
CREATE OR REPLACE VIEW vehicles AS
SELECT v.id, v.number, v.callsign, v.is_active, v.created_at, v.updated_at,
       a.max_payload, a.fuel_type, a.vehicle_type, a.empty_vehicle_weight
FROM master_vehicles v
LEFT JOIN logistics_vehicle_attrs a ON v.id = a.vehicle_id;
```
**理由**: `logistics_vehicle_attrs.empty_vehicle_weight`（空車重量）はDB上に存在していたが、`vehicles` ビューに含まれていなかった。`fetchVehicles` で `tareWeight` として使用するため公開。

### 2. `staffs` テーブルに `phone_number` 列追加
```sql
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS phone_number text DEFAULT '';
```
**理由**: `fetchColleagues` で同僚の電話番号を取得するため。従来はハードコード `'00-0000-0000'` だった。
