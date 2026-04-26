# Technical Debt & Future Roadmap (RePaper Route)

## 1. Technical Debt (技術的負債)
*解決すべき技術的課題、リファクタリング対象*

- [x] **[Path Fragility] 統治ツールのパス解決**: `gov_loader.js` の強化と各スクリプトの `PROJECT_ROOT` SSOT化により解決。
- [ ] **[Supabase Sync] インフラ統治統合**: ルートと `apps/repaper-route` の `supabase/` フォルダの完全な一本化と環境変数の同期。
- [ ] **[AuthAdapter Integration] 全社標準 Staff スキーマ準拠**: `AuthAdapter.ts` を介し、旧 profile 形式から Staff スキーマへ完全移行。これをもって全社標準への準拠を完了とする。
- [ ] **[Git Hooks Sync]**: `husky` がモノレポ構造を正しく認識し、各ワークスペースの `lint-staged` をトリガーできているかの検証。

## 2. Future Roadmap (将来構想)
*未実装の機能、将来的な拡張計画*

### Phase 6: Logic-Driven Efficiency (直近の優先事項)
> [!IMPORTANT]
> **AI開発 vs 論理実装の原則 (ADR-0011)**
> AIエージェント（Antigravity等）による高度なコード構築と設計の強力な推進。一方で、アプリ内での実装ロジックは「論理的計算（アルゴリズム）」に限定すること。

- [ ] **DeltaManager (Logic Edition)**: AIエージェントが設計した、差分分析および変更インパクトの論理計算エンジンを構築。
- [ ] **Structural Validation**: AIを介さず、絶対的制約（10kg単位制約、業務時間、合計重量要件等）に基づいた厳格なバリデーションの実装。

### Phase 7: TBNY DXOS Standard Integration
- [ ] **Audit Trail v2**: 変更履歴を追記型台帳（JSONL + DB）への二重記録。
- [ ] **OAuth2 Transition**: Staff認証基盤の標準 OAuth2 プロトコルへの移行。

### Appendix: AI-Enhanced Intelligence (戦略的余白)
*エージェントの効果を再評価し、SDRデータが十分に蓄積された段階で再開を検討する。*

- [ ] **SemanticExtractor**: 業務ドキュメントからの意味抽出（LLM活用）。
- [ ] **VLM-Based Visual Check**: 視覚言語モデルを用いた計量器の数値整合性確認。

---
> [!IMPORTANT]
> 本書は `governance/` 配下の SSOT（単一真実源）として管理されます。
