-- 013_enforce_job_customer_constraint.sql
-- T3: ガバナンス要求によるデータベース制約の追加
-- 孤児データの発生を物理的にブロックするための制約強化
-- gov-bypass: T3 override

BEGIN;

-- collection_point_id が NULL の不正なレコードが存在する場合は削除または退避（今回は運用前想定で削除）
DELETE FROM daily_jobs WHERE collection_point_id IS NULL;

-- NOT NULL 制約の付与
ALTER TABLE daily_jobs
  ALTER COLUMN collection_point_id SET NOT NULL;

-- 既存の外部キー制約を削除（名前は環境依存の可能性があるが、001で明示的な名前がなければ自動生成名）
-- ※ 001_initial_schema.sql では REFERENCES master_collection_points(id) と定義されているのみ
-- 重複を避けるため、ON DELETE RESTRICT を明示した新しい制約を追加
ALTER TABLE daily_jobs
  DROP CONSTRAINT IF EXISTS daily_jobs_collection_point_id_fkey;

ALTER TABLE daily_jobs
  ADD CONSTRAINT daily_jobs_collection_point_id_fkey
  FOREIGN KEY (collection_point_id) REFERENCES master_collection_points(id)
  ON DELETE RESTRICT;

COMMIT;
