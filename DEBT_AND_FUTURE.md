# Technical Debt & Future Roadmap (TBNY DXOS)

## [Resolved] 2026-05-10: Driver App Integrity Restoration
- **Remediation**: Fixed UTF-8 mojibake in critical driver pages (`NumericKeypad`, `EndShiftPage`, etc.) causing runtime crashes.
- **UI Refinement**: Resolved overlapping inputs and scroll lock issues in `FuelPage` by refactoring to a 100vh layout with `border-box` sizing.
- **Verification**: 100% build pass and physical DOM verification completed (GSEAL issued).

## ⏸️ 保留中・未封印タスク (Suspended Tasks)
<!-- ここに自動退避されたタスクがスクリプトにより追記・消込されます -->

## Technical Debt (残存負債)

### DXOS 全体
- [ ] **[PWA_ASSET_DEBT]**: `manifest.json` のアイコンが `vite.svg` の暫定流用。正式なアセット生成と差し替えが必要。
- [ ] **[MODULE_INTEGRATION_DEBT]**: RePaper Route 等の外部モジュールとの物理的な統合（リンク、データ連携、SSO）。現在 Portal 側からの並行起動を復旧済み。
- [ ] **[SWR_FULL_ADOPTION]**: 全データフェッチ層への `useSWR` パターンの導入（オフライン耐性の強化）。

### RePaper Route
- [x] **[Path Fragility] 統治ツールのパス解決**: SSOT化完了。
- [x] **[AuthAdapter Integration] Staff スキーマ準拠**: `AuthAdapter.ts` への移行完了。
- [ ] **[DATABASE_FOREIGN_KEY_DEBT]**: クラッシュ防止用の `jobs_customer_id_fkey` 外部キー制約の追加。ローカル開発インフラ（DNS 閉塞 & IPv6 制限）により Dashboard からの手動実行が必要。
- [ ] **DeltaManager (Logic Edition)**: 差分分析および変更インパクトの論理計算エンジンの構築。
- [ ] **Structural Validation**: 10kg単位制約、合計重量要件等の厳格なバリデーション実装。
- [ ] **Audit Trail v2**: 変更履歴を追記型台帳（JSONL + DB）への二重記録。
- [x] **[Git Hooks Sync]**: `husky` & `lint-staged` 導入による自動化強制力の配備完了。
- [ ] **[DriverApp Bridge] Supabase 実装**: `useDriverOSBridge` の実 DB 同期（TASK-001 で部分対応済み）。
- [ ] **[DriverApp Assets] アイコン資産の Lucide 移行**: FontAwesome への残存依存を解消し、Lucide へ完全移行することを推奨。

## 2026-05-05: 構造的防護と静的解析の強化
- **対策**: `ErrorBoundary` の導入（LazyWrapper 単位）と `consistent-type-imports` ルールの強制。
- **目的**: インターフェースの値インポートに起因する SyntaxError（ホワイトアウト）の根絶。
- **リスク管理プロトコル**:
    - **[差分制御]**: 全ファイルへの一括適用（auto-fix）は禁止する。修正・追加したファイルから順次適用することで、Git 履歴の健全性を保つ。
    - **[観測維持]**: `ErrorBoundary` は `console.error` にスタックトレースを排出し続ける。将来的に SWR/Supabase 経由でのサーバーサイドログ出力を検討。
    - **[ビルド摩擦]**: `tsconfig.app.json` の `incremental: true` を維持し、型チェックによる待ち時間を最小化する。
    - **[React インポート]**: `verbatimModuleSyntax: true` 環境下では、JSX を使用し `React.FC` 等を参照する場合、`import React from 'react'` の明示的なインポートが必須となる（React 19 以降でもランタイムエラーを避けるため）。

## Future Roadmap (将来構想)
- [ ] **TBNY DXOS Core Implementation**: ポータル基盤と各モジュールのシームレスな統合（SSO含む）。
- [x] **[DEVOPS_FIX]**: 開発サーバー並行起動の復旧 (2026-05-01)。
- [x] **Sentinel Governance v8.1 Protocol Enforcement**: `SDR Auto-Validator` & `Directory Machine` による完遂ゲートの自動化完了 (2026-05-16)。
- [ ] **[Next Phase Start] useDriverOSBridge.ts への実ロジック注入**: スタブを排して実 DB 同期を実装。
- [ ] **OAuth2 Transition**: Staff 認証基盤の標準プロトコルへの移行。
- [ ] **SemanticExtractor**: 業務ドキュメントからの意味抽出（LLM活用）。
- [ ] **VLM-Based Visual Check**: 視覚言語モデルを用いた計量器の数値整合性確認。

### Abandoned Concepts (永久凍結・破棄)
- **OS-Level ACL Separation (マルチエージェントの物理権限分離)**: 運用オーバーヘッドとAntigravity環境との不整合のため完全に中止。将来の再検討も行わない（ADR-0017参照）。

---
> [!IMPORTANT]
> 本書は TBNY DXOS 全体の技術的負債とロードマップの SSOT（単一真実源）です。
