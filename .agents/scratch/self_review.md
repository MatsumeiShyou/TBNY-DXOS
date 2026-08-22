# Self Review
- 問題: マスタ登録や一括設定において顧客の定期スケジュール（jobType等）が変更された際、当日のPendingJobsリストから手動で登録した「スポットジョブ（シリーズ含む）」まで巻き添えで削除されてしまうバグがあった。
- 対策: `updateCustomer` および `saveBulkCustomers` における pendingJobs のフィルタリング処理を見直し、自動生成された定期ジョブ（`id.startsWith('gen_')`）のみを削除・再生成の対象とするよう修正した。
- 影響範囲: 既存のスケジュールロジックには影響せず、手動登録された例外的なスポットデータが安全に保護される。
- UI側: `PendingJobsModal.jsx`において、これまで `preferredTime` の有無だけで「スポット」バッジを誤判定していた処理を、正確に `jobType === 'spot'` と `jobType === 'regular'` で判定し、「定期」「スポット」のバッジを表示し分けるよう修正。

[REVIEW_PASSED]
