-- 012_add_customer_is_deleted.sql
-- 顧客（master_collection_points）に論理削除用のフラグを追加する

ALTER TABLE master_collection_points ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- 既存のデータを保護するため、削除済みのものを判定する仕組みに移行します。
