# Technical Debt & Future Roadmap (RePaper Route)

## 1. Technical Debt (技術的負債)
*解決すべき技術的課題、リファクタリング対象*

- [x] **[Path Fragility] 統治ツールのパス解決**: SSOT化完了。
- [x] **[AuthAdapter Integration] Staff スキーマ準拠**: `AuthAdapter.ts` への移行完了。
- [ ] **DeltaManager (Logic Edition)**: 差分分析および変更インパクトの論理計算エンジンの構築。
- [ ] **Structural Validation**: 10kg単位制約、合計重量要件等の厳格なバリデーション実装。
- [ ] **Audit Trail v2**: 変更履歴を追記型台帳（JSONL + DB）への二重記録。
- [ ] **[Git Hooks Sync]**: `husky` がモノレポ構造を認識し、確実にバリデーションを実行できているかの検証。

## 2. Future Roadmap (将来構想)
- [ ] **OAuth2 Transition**: Staff 認証基盤の標準プロトコルへの移行。
- [ ] **SemanticExtractor**: 業務ドキュメントからの意味抽出（LLM活用）。
- [ ] **VLM-Based Visual Check**: 視覚言語モデルを用いた計量器の数値整合性確認。

---
> [!IMPORTANT]
> 本書は `governance/` 配下の SSOT（単一真実源）として管理されます。
