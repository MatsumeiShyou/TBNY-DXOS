# Schema History

データベーススキーマの変更履歴を記録する。

## 変更履歴

| 日付 | 変更内容 | 影響範囲 | 実施者 | DDLファイル |
|------|----------|----------|--------|-------------|
| 2026-08-24 | 初期スキーマ構築（13テーブル, 4 ENUM, 2関数, 5トリガー） | 全テーブル新規作成 | User + AI | `scripts/001_initial_schema.sql` |

### 2026-08-24: 初期スキーマ構築
- **ADR**: `governance/ADR/001_supabase_hybrid_architecture.md`
- **テーブル (13)**: `event_logs`, `master_payers`, `master_contractors`, `master_collection_points`, `master_items`, `master_workers`, `master_vehicles`, `master_resource_availability`, `daily_jobs`, `weighing_records`, `actuals`, `templates`, `template_jobs`
- **ENUM (4)**: `event_type`, `job_status`, `visit_slot`, `resource_type`
- **関数 (2)**: `audit_trigger_func()`, `protect_from_delete()`
- **トリガー (5)**: `tr_audit_daily_jobs`, `tr_audit_actuals`, `tr_audit_templates`, `tr_audit_resource_availability`, `tr_prevent_delete_daily_jobs`

## 2026-08-24 daily_jobs テーブルへのカラム追加

`sql
ALTER TABLE daily_jobs
  ADD COLUMN vehicle_id UUID REFERENCES master_vehicles(id),
  ADD COLUMN worker_id UUID REFERENCES master_workers(id),
  ADD COLUMN sequence_order INTEGER,
  ADD COLUMN front_id VARCHAR(100);
`

## 2026-08-24 RLSポリシーの適用 (Step 5)

anonフルアクセスポリシーを削除し、authenticated(ログイン済み)のみ全許可するポリシーを全テーブルに適用。
