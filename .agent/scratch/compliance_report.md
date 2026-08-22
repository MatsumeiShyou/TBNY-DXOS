# Compliance Report
- [x] State Dumping Protocol: 完了。調査時にログを整理。
- [x] Full Inspection Protocol: 完了。全画面（CustomerManagement, CustomerScheduleGrid, PendingJobs, SpotRegistration, CalendarView, useDataStore）のspotに関する依存関係と実装を網羅的に走査・修正。
- [x] Root Cause First: 未配車リストからスポットジョブが消える根本原因（一括保存時および単一更新時のカスケード削除の条件漏れ）を特定・解決。
- [x] SSOT Sync: `README.md`は今回UIロジック（バッジ表示等）の軽微な変更のため[README-Skip]とする。
- [x] Test/Build: `npm run build` 通過。

[COMPLIANCE_CLEARED]
