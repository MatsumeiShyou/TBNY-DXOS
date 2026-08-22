---
name: supabase-workflow
description: >-
  Supabaseデータベースのスキーマ変更、マイグレーション実行、CLIの
  IPv6/Pooler接続問題の対処時に使用する。AGENTS.mdのSection 10の
  環境固有ルールに基づく。
---

# Supabase ワークフロー

## スキーマ変更手順（AGENTS.md Section 10準拠）

1. **事前確認**: `knowledge/supabase_cli_ipv6_pooler_fix/artifacts/manual.md` を読む
2. **変更実施**: Supabase Dashboard または SQL Editor でスキーマ変更
3. **差分生成**: `npx supabase db diff` を実行
4. **記録**: 生成されたSQLを `SCHEMA_HISTORY.md` に追記
5. **承認**: スキーマ変更はT3（人間の明示的承認が必要）

## IPv6 / Pooler 接続問題

Supabase CLI や直接接続を行う前に、必ず以下のマニュアルを確認すること：

```
knowledge/supabase_cli_ipv6_pooler_fix/artifacts/manual.md
```

## プロダクト固有ルール（AGENTS.md Section 9準拠）

- 回収案件（スポット含む）はすべて顧客マスタに紐づける
- マスタに存在しない孤児データは許可しない
- 未配車リストは顧客マスタと照合し、存在しないものは非表示・破棄する
