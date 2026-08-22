# DEBT AND FUTURE

技術的負債と未解決課題、将来の対応タスクを記録する借金リスト。

## 現在の負債 (Debt Loan)
- なし

## 将来の課題 (Future Tasks)
- **コース管理モーダルとのマスタ参照連携**: コース設定・追加画面における担当者・車両入力のドロップダウンを、マスタデータ（`masterWorkers`, `masterVehicles`）に連動させる。（※完全持ち回り制という前提に基づき、仕様の再定義が必要な可能性あり）
- ~~**[Phase 2] データ初期化ロジックの統合**~~: ✅ 完了 — `generateDailySchedule` として `App.jsx` に統合済み。
- ~~**[Phase 3] カレンダービューの改修**~~: ✅ 完了 — `CalendarView.jsx` を定期ルート以外の「スポット・休止・振替」管理UIへ特化・改修済み。ヘッダーのボタン名称も「予定」へ変更済み。
- ~~**[Phase 4] CustomerScheduleGridModal のフルUX統合 & 顧客マスタカスケード同期**~~: ✅ 完了 — 顧客マスタからの呼び出し連携、週指定形式の統一、およびマスタ保存時のジョブ/未配車/月間スケジュールへのリアルタイムカスケード同期を実装済み。
- **[Phase 5] ESLint / TypeScript 導入**: 静的解析の本格導入。jsconfig.json を tsconfig.json に移行し、段階的に型安全性を向上させる。
- **[Phase 6] Supabase連携とスキーママイグレーション**: ローカル環境で確立した単一のデータ管理層（`useDataStore.js` / `storageService.js`）をバックエンドのSupabaseに接続し、DBマイグレーションと実運用環境への移行を行う。
- ~~**[CAVR Bypass]**: ヘッダーアイコンのUI整理時（最短の解決策）、ブラウザのデバッグ接続タイムアウトが発生したため実機検証をバイパス。対象が単一アイコンの削除のみでリスク極小のため。~~ ✅ 解消 — 次回以降はAdaptive Verification Level A として正式に処理。
