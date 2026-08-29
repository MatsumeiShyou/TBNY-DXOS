-- ============================================================
-- Step 5: RLS (行レベルセキュリティ) の本格適用
-- ============================================================

-- 1. 暫定的に設定していた「誰でも(anon)全許可」のポリシーを削除
-- 削除対象テーブル: event_logs, master_*, daily_jobs, weighing_records, actuals, templates, template_jobs
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all operations for anon" ON %I;', rec.tablename);
  END LOOP;
END;
$$;

-- 2. 「ログイン済みユーザー(authenticated)」のみ全操作を許可するポリシーを作成
-- (※社内向けのシングルテナント運用を想定し、権限分離は行わないベース設定)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('CREATE POLICY "Allow authenticated full access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true);', rec.tablename);
  END LOOP;
END;
$$;
