# DEBT AND FUTURE

技術的負債と未解決課題、将来の対応タスクを記録する借金リスト。

## 現在の負債 (Debt Loan)
- **開発用オートログイン機構のクリーンアップ**: `src/main.tsx` に実装された開発用自動ログイン（`VITE_AUTO_LOGIN_EMAIL` を用いた認証バイパス機構）および、Supabase上のテストユーザー（`test_agent@example.com`）は開発・自動テスト専用の限定処置であるため、開発終了後または本番デプロイ時に必ずクリーンアップ（削除）すること。
- ~~**Antigravity post-write-checkの不完全性**~~: ✅完了 (`hooks.json` は廃止され、`done.js` 内のCompilation GateでLintと型チェックが正式稼働済み)

## 将来の課題 (Future Tasks)
- ~~**コース管理モーダルとのマスタ参照連携**~~: ✅完了 (`CourseManagementModal.tsx` が `masterWorkers`, `masterVehicles` を適切に受け取り表示するよう実装済み)
- ~~**[Phase 2] データ初期化ロジックの統合**~~: ✅完了 (`generateDailySchedule` として `App.jsx` に統合済み)
- ~~**[Phase 3] カレンダービューの改修**~~: ✅完了 (`CalendarView.jsx` を定期ルート以外の「スポット・休止・振替」管理UIへ特化の改修済み。メニューのボタン名称も「予定」へ変更済み)
- ~~**[Phase 4] CustomerScheduleGridModal のフルUX統合 & 顧客マスタカスケード同期**~~: ✅完了 (顧客マスタからの呼び出し連携、保持形式の統一、およびマスタ保存時のジョブ未配置の月間スケジュールへのリアルタイムカスケード同期を実装済み)
- ~~**[Phase 5] ESLint 導入**~~: ✅完了 (統治構造改修（自己修復ループ）の前提として ESLint (Flat Config) を導入済み)
- **[Phase 5.5] TypeScript 導入**: 静的解析の本格導入。jsconfig.json を tsconfig.json に移行し、段階的に型安全性を向上させる。（大部分は移行済み）
  - **残存負債（Lint設定の正規化）**: Lintゲートウェイ導入時にエラー回避・トークン節約の目的で一時的に `warn` や `off` に降格したルール（`@typescript-eslint/no-explicit-any`, `prefer-const`, `react/prop-types` 等）を `error` に戻し、コードベース全体で型・構文の健全性を満たすこと。
- ~~**[Phase 6] Supabase連携とスキーマ・マイグレーション**~~: ✅完了 (`useDataStore.ts` / `storageService.ts` がSupabaseに完全接続し、RLS権限も含め実運用環境への移行を完了済み。スキーマ履歴は `SCHEMA_HISTORY.md` に分離記録)
- ~~**[CAVR Bypass]**: ヘッダーアイコンのUI整理（最短の解決策）、ブラウザのデバッガ接続タイムアウトが発生したため実機検証をバイパス。対象が単一アイコンの削除のみでリスク極小のため。~~ ✅解決 (次回以降の Adaptive Verification Level A として正式に処理)
- **統治スクリプトの拡張 (`.agents/` 対応)**: `scan.js` や `done.js` が、AGENTS.md だけでなく `.agents/` 側のAntigravityカスタマイゼーション（skills, Hooks, Subagents）の整合性も検証できるようにする。
