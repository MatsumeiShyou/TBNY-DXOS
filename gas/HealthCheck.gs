/**
 * データベースの異常やデータ不整合を監視するヘルスチェックバッチ
 */

function runHealthCheck() {
  Logger.log('[HealthCheck] 実行開始');
  const errors = [];

  try {
    // 1. 長期間放置されている未完了の案件 (例: 1週間前のPLANNED案件)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoString = oneWeekAgo.toISOString().split('T')[0];

    const stuckJobsQuery = `planned_date=lt.${oneWeekAgoString}&status=eq.PLANNED`;
    const stuckJobs = supabaseSelect('daily_jobs', stuckJobsQuery);

    if (stuckJobs && stuckJobs.length > 0) {
      errors.push(`${stuckJobs.length} 件の長期間未完了(PLANNED)の案件が存在します。`);
    }

    // 2. その他の整合性チェック (必要に応じて追加)
    
    // --- 判定と通知 ---
    if (errors.length > 0) {
      Logger.log('[HealthCheck] 異常を検知しました:');
      errors.forEach(err => Logger.log(` - ${err}`));
      
      // TODO: 管理者へのメール送信等の通知ロジックを追加
      // MailApp.sendEmail('admin@example.com', '[回収アプリ] 自動ヘルスチェック警告', errors.join('\n'));
    } else {
      Logger.log('[HealthCheck] 異常は見つかりませんでした。正常です。');
    }

  } catch (error) {
    Logger.log(`[ERROR] HealthCheck 中にエラーが発生しました: ${error.message}`);
  }
}
