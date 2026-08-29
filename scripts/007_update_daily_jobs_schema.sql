-- 007_update_daily_jobs_schema.sql
-- T3: ガバナンス要求によるスキーマ追加（A案）
-- gov-bypass: T3 override

ALTER TABLE daily_jobs
  ADD COLUMN front_id VARCHAR(100),
  ADD COLUMN vehicle_id VARCHAR(50),
  ADD COLUMN sequence_order INTEGER;
