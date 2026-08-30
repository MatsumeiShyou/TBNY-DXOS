/**
 * 過去データのエクスポートと物理削除(パージ)を行うバッチ処理
 */
const ARCHIVE_SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // 退避先スプレッドシートのID
const RETENTION_DAYS = 90; // 何日より前のデータを削除するか

function runArchiveAndPurge() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - RETENTION_DAYS);
  const targetDateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
  
  Logger.log(`[ArchiveAndPurge] 実行開始: ${targetDateString} より前のデータを退避・削除します。`);

  try {
    // 1. 退避対象のデータをSupabaseから取得
    // (ここでは例として daily_jobs を取得)
    const query = `planned_date=lt.${targetDateString}&select=*,weighing_records(*),actuals(*)`;
    const oldJobs = supabaseSelect('daily_jobs', query);

    if (!oldJobs || oldJobs.length === 0) {
      Logger.log('[ArchiveAndPurge] 退避対象のデータはありませんでした。');
      return;
    }
    
    Logger.log(`[ArchiveAndPurge] ${oldJobs.length} 件の daily_jobs を取得しました。スプレッドシートに退避します。`);

    // 2. Googleスプレッドシートに書き出し
    const sheet = SpreadsheetApp.openById(ARCHIVE_SPREADSHEET_ID).getSheetByName('daily_jobs_archive');
    if (!sheet) {
      throw new Error(`シート 'daily_jobs_archive' が見つかりません。`);
    }

    const rows = oldJobs.map(job => [
      job.id,
      job.planned_date,
      job.collection_point_id,
      job.status,
      JSON.stringify(job.weighing_records),
      JSON.stringify(job.actuals)
    ]);
    
    // スプレッドシートの末尾に追記
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      SpreadsheetApp.flush(); // 書き込みを確定させる
    }

    Logger.log(`[ArchiveAndPurge] 退避完了。Supabaseからの物理削除(パージ)を実行します。`);

    // 3. SupabaseのRPCを呼び出して安全に物理削除を実行
    const payload = { target_date: targetDateString };
    const deletedCount = supabaseRpc('purge_old_data', payload);

    Logger.log(`[ArchiveAndPurge] 実行完了: ${deletedCount} 件のレコードを物理削除しました。`);
    
  } catch (error) {
    Logger.log(`[ERROR] ArchiveAndPurge 中にエラーが発生しました: ${error.message}`);
    // 必要に応じて管理者へのメール通知等の処理を追加
  }
}
