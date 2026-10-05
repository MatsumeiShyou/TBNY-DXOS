-- ==========================================
-- 015_add_daily_jobs_ui_column_id.sql
-- 配車盤の列ID（d1 等）を保持するカラムの記録
-- ==========================================
-- 本番DBには既に存在するが、スキーマ定義に未記録だったカラムを正典化する。
-- 適用済み環境で再実行しても影響がないよう IF NOT EXISTS とする。
-- アプリは ui_column_id を優先し、旧データは vehicle_id に入った列IDを読み替える。

ALTER TABLE public.daily_jobs ADD COLUMN IF NOT EXISTS ui_column_id TEXT;
