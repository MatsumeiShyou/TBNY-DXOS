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
- **統治スクリプトの拡張 (`.agents/` 対応 + ルート衛生)**: `scan.js` や `done.js` が、AGENTS.md だけでなく `.agents/` 側のAntigravityカスタマイゼーション（skills, Hooks, Subagents）の整合性も検証できるようにする。加えて、プロジェクトルート直下のAI作業痕跡スクリプト（`fix_*`, `patch_*` 等）の検知・警告機能を追加する。（物理強制層として `.gitignore` パターン + `.husky/pre-commit` hookは導入済み）
- **[Phase 7] コンポーネント・フック分割**: `App.tsx`（50KB超）、`CustomerManagementModal.tsx`（52KB超）、`useDataStore.ts`（31KB・ゴッドフック）の責務分離。D&Dロジック・モーダル管理・フォーム状態をそれぞれ専用のhook/コンポーネントに分割する。
- **[Phase 8] コアロジックのテスト追加**: テストカバレッジが極めて低い。優先対象は (1) `calendarUtils.ts` のスケジュール生成ロジック、(2) `useDataStore` の状態更新（特にdeleteCustomer・saveBulkCustomers）、(3) `storageService` のDB連携（モック使用）。
- **[Phase 9] 保存処理の差分更新化**: 現在の500ms全件upsert（`saveDailyState` / `saveMasterData`）を差分更新に置き換え、ネットワーク・DB負荷を軽減する。ユーザー数増加時のボトルネック予防。
- **[Phase 10] セキュリティの強化（RLSポリシーの正規化）**: 現在のSupabaseデータベースは、開発初期の暫定措置（\ 04_temp_rls_policy.sql\）により、全テーブルに \USING (true) WITH CHECK (true)\ が適用され、誰でも全てのデータの読み書きが可能となっている。本番運用に向けて、Authユーザー（認証済み作業員・管理者）と対象データの関係に基づく、ロールベースの適切なRow Level Security (RLS) ポリシーを設計・適用すること。

---

### 外部レビューからのAI統治構造改善フィードバック (2026-09-25受領)

外部AI（Claude等）によるアーティファクトレビューの結果、以下の8点が統治構造を実効化するための優先課題として特定されました。これらは既存の「AI統治構造の改善計画」を補完・強化するものです。

1. ~~**[優先度:高] GATE-2（post-write-check.js）の早期実効化**~~: ✅完了
   - 現在ESLint未導入のダミー実装となっているGATE-2を最優先で稼働させ、自己修復ループを機能させる。
2. ~~**[優先度:高] gov-bypassタグの機械的検証化**~~: ✅完了
   - `safety-check.js` で `// gov-bypass` を検知した際、単にタグの有無だけでなく `AMPLOG.jsonl` に承認記録（T3相当）が存在するかをスクリプトで検証し、必須化する。
3. ~~**[優先度:高] 永続化層のSupabase完全移行とDB制約化 (PROD-1の実効化)**~~: ✅完了
   - 現状のLocalStorage+JSON APIへの書き込み依存から脱却し、Supabaseへの完全移行を進める。その際、PROD-1（孤児データ禁止）をDBの `NOT NULL` および外部キー制約レベルで物理的に担保する。
4. **[優先度:中] ティア判定の機械的セカンドオピニオン**:
   - `safety-check.js` 等でファイル内容をスキャンし、SQL DDL、決済・認証関連コードなどを検知した場合は、自己申告ティアに関わらず強制的にT3へエスカレーションさせる。
5. **[優先度:中] 統治文書のSSOT／バージョン管理**:
   - ドキュメント生成時にヘッダーへ「抽出日時」や「コミットハッシュ」を明記する。`scan.js` にADR番号と内容の整合性チェックを追加する。
6. **[優先度:中] T3承認の形骸化防止**:
   - 破壊的変更（DROP/TRUNCATE等）の承認時、単なる `y` 入力ではなく、リスクの復唱や特定キーワードの入力を求めるなど、確認の摩擦を設計する。
7. **[優先度:低〜中] worklogの蓄積化**:
   - T2タスクの `worklog.md` を上書き消去せず、完了チェック時にアーカイブフォルダへ履歴として残す。
8. **[優先度:低] プロンプトインジェクション対策の明文化**:
   - `AGENTS.md` に「コード（指示）」と「データ（顧客入力の自由記述）」を明確に区別する旨を記載する。
