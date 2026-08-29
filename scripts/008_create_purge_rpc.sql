-- ==========================================
-- GAS同期用: アーカイブ済み古いデータの物理削除関数
-- ==========================================

-- この関数は、指定した日付より古い daily_jobs と、
-- それに紐づく weighing_records, actuals を物理削除します。
-- GAS側でスプレッドシートへの退避が成功した後にのみ呼び出されます。

CREATE OR REPLACE FUNCTION purge_old_data(target_date DATE)
RETURNS INTEGER AS $$
DECLARE
  deleted_jobs_count INTEGER := 0;
BEGIN
  -- システムパージモードを有効化（protect_from_delete トリガーをバイパスするため）
  PERFORM set_config('app.system_purge_mode', 'true', true);

  -- 1. actuals の削除 (daily_jobsに依存するため先に削除)
  DELETE FROM actuals 
  WHERE job_id IN (
    SELECT id FROM daily_jobs WHERE planned_date < target_date
  );

  -- 2. weighing_records の削除
  DELETE FROM weighing_records 
  WHERE job_id IN (
    SELECT id FROM daily_jobs WHERE planned_date < target_date
  );

  -- 3. daily_jobs の削除
  WITH deleted AS (
    DELETE FROM daily_jobs 
    WHERE planned_date < target_date
    RETURNING id
  )
  SELECT count(*) INTO deleted_jobs_count FROM deleted;

  -- 4. 古い event_logs の削除 (関連性に関わらず、指定日付より古いログを削除)
  DELETE FROM event_logs 
  WHERE created_at < target_date;

  RETURN deleted_jobs_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 関数に対する権限設定 (service_role キーでのみ実行可能とする)
REVOKE ALL ON FUNCTION purge_old_data(DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION purge_old_data(DATE) FROM anon;
REVOKE ALL ON FUNCTION purge_old_data(DATE) FROM authenticated;
GRANT EXECUTE ON FUNCTION purge_old_data(DATE) TO service_role;
