# ADR-0019: Ultimate Patch Interlock and Auto-Completion

* Status: Accepted
* Date: 2026-05-23
* Decider: AI Agent & User

## Context and Problem Statement
従来の統治システムにおいて、エージェントが本番ファイルをパッチ経由ではなく直接編集してしまうリスクや、開発中の変更が未封印のまま新しいスキャンタスクが走ることによる不整合リスクなど、「人間の記憶や自己規律」のみに依存した脆弱性が残っていました。
また、ユーザーから最終承認（ｙ）を受けた後に、エージェント自身がタスクを自動完遂する義務が明記されていなかったため、運用の自動化と確実性をより強固に担保する必要がありました。

## Decision Drivers
* パッチ分離システムを経由しない「直接編集」の物理的な排除
* 変更残存状態での不要な agent:scan の事前ブロックによるSSOT破壊の防止
* 最終承認（ｙ）後のコミット・GSEAL発行の自律的・連続的な自動実行の強制

## Considered Options
1. **静的検証・人間による注意喚起**: 引き続きルール上の注意にとどめ、チェックを簡素にする。
2. **物理的インターロックと自律実行義務の最高憲法化（採用）**: 直接編集時にフラグを照合して完遂をブロックし、スキャン時に未封印変更を自動検知してエラー終了させ、さらに `npm run done` を承認直後にエージェント自身が連続実行することを最高憲法 `AGENTS.md` に追記して物理強制する。

## Decision Outcome
Chosen option: **Option 2**.
AST解析や人間の規律に依存せず、`patch_applied.flag` の有無による直接編集遮断、`git status` とパッチディレクトリの事前チェックによる未完遂スキャンブロック、および承認受領直後のタスク自動完遂義務（Self-Completion Rule）を導入・強制します。

### Consequences
* **Positive**:
  - 本番ファイルの偶発的な直接編集によるデグレードやデシリアライズの根絶。
  - プロセスの完全自動化によるユーザーの運用・実行負荷の激減。
* **Negative**:
  - デバッグ時や実験時の一時変更でも `npm run done` を走らせる必要があり、開発初期の融通性が一部制限される（ただしセーフモード等の活用により回避可能）。

## Validation Plan
* `git status --porcelain` および patches ディレクトリ走査により、 scan.js 起動時に適切にブロックされることを検証。
* パッチを経由しない直接書き換え時に `closure_gate.js` が `DIRECT EDIT VIOLATION` エラーで終了することを実機確認。
