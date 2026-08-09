# ADR 002: Future Tasks Reflection の導入

## Status
Accepted

## Date
2026-08-09

## Context
ユーザーより `/learn` コマンドを通じて、「実装後は DEBT_AND_FUTURE.md の『将来の課題 (Future Tasks)』セクションへ反映することを永続化せよ」との指示があった。
タスクを完了した際、残った機能や将来的な課題がそのまま放置されるのを防ぐため、AIが自律的に `DEBT_AND_FUTURE.md` を更新するプロセスを明示的なルールとして定義する必要がある。

## Decision
最高憲法である `AGENTS.md` の「2. B群：認知と推論による遵守 (Cognitive Compliance)」に、新ルール `[Future Tasks Reflection]` を追加した。

```markdown
- **[Future Tasks Reflection]**: 実装完了後、未対応の要件や次のステップとして残る課題がある場合は、必ず `DEBT_AND_FUTURE.md` の「将来の課題 (Future Tasks)」セクションへ追記すること。また、実装を完了した課題は同セクションから削除・更新し、タスクの完了報告とセットで同期を完了させよ。
```

## Consequences
- 実装タスクが完了するたびに、AIは必ず `DEBT_AND_FUTURE.md` をレビューし、完了したタスクの削除および次フェーズ・残課題の追加を自律的に行う。
- ユーザーによる「将来の課題への反映漏れ」の指摘や再度のリマインドを防ぐことができる。
- プロジェクトのタスク管理とドキュメント（SSOT）が常に最新の状態に保たれる。
