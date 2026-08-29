-- Supabase DashboardのSQL Editorでテーブルを作成した際、
-- APIからのアクセス(anon, authenticated)やトリガー内部での書き込みに必要な
-- 基本権限（GRANT）が不足している場合があります。
-- 以下のSQLを実行して、必要な権限を付与してください。

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
