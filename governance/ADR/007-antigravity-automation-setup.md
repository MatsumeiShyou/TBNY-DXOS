# ADR-007: Antigravity 2.0 自律開発基盤の導入

**日付**: 2026-08-22  
**ティア**: T3  
**ステータス**: 承認済み・実装完了

## コンテキスト

ワークスペースにAntigravity 2.0のカスタマイゼーション基盤（Skills, Hooks, Subagents）が存在せず、
自律開発の安全性・効率性向上のために体系的な基盤構築が必要だった。

## 決定

以下の基盤をPhase 0〜4で段階的に構築した：

1. **Phase 0**: チェックポイントコミット（`962d781`）
2. **Phase 1**: `.agents/skills/` に3つのSkill定義を作成
   - `react-vite-dev`: React 19 + Vite + Tailwind CSS v4の開発ガイド
   - `supabase-workflow`: Supabaseワークフロー
   - `governance-workflow`: AGENTS.md統治プロセス
3. **Phase 2**: グローバル `~/.gemini/antigravity-cli/settings.json` 新規作成
4. **Phase 3**: `.agents/hooks.json` + 2本のNode.jsスクリプト
   - PreToolUse: 危険コマンドゲート（safety-check.js）
   - PostToolUse: ファイル書き込み後チェック（post-write-check.js）
5. **Phase 4**: `.agents/agents/` に2つのサブエージェント定義
   - `code-auditor`: 読み取り専用の品質・セキュリティ監査
   - `react-builder`: React/Viteコンポーネント開発

## 根拠

- 一次情報: Antigravity公式ドキュメント（Hooks Guide, Skills Guide）および環境内蔵のツール定義
- hooks.jsonのI/O契約は `.gemini/antigravity/builtin/skills/agy-customizations/docs/hooks.md` に準拠
- ツール名は現在のエージェント環境のシステムプロンプトで実在を確認

## リスクと軽減策

- グローバル settings.json は全プロジェクト共通 → 影響範囲を完了報告に明記
- フックのstdout汚染 → デバッグログはすべてstderrに出力する設計
- サブエージェントのハングアップ → ツール名を一次情報から確認、起動テストを実施
