# SCHEMA_HISTORY.md — DB スキーマ変更履歴

> AGENTS.md [SQL Sync] に基づき、スキーマ変更を記録する。

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
