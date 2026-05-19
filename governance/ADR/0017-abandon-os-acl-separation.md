# ADR-0017: Permanent Abandonment of OS-Level ACL Separation for Agents

* **Status**: Accepted
* **Date**: 2026-05-16
* **Decider**: User

## Context and Problem Statement
当初、マルチエージェント・オーケストレーションの理想形として、OSレベルのアクセス制御リスト（ACL）と複数のローカルユーザーアカウントを用いた物理的な権限分離が検討されていました。しかし、実装の複雑さや既存の単一ユーザー環境（Antigravity/Node.js/npm）への統合コストの高さが懸念されていました。

## Decision Drivers
* システム統合のオーバーヘッドと運用コストの増大。
* 既存のAntigravityツールセットが単一コンテキストでの実行を前提としていること。
* `wip/review/completed` ディレクトリによるステートマシンと自動バリデーターで、目的とする統治強度（ハルシネーションと不整合の防止）が十分に達成されたこと。
* ユーザーからの「完全な中止」という明確な方針決定。

## Considered Options
1. 一時凍結し、将来のロードマップとして残す（却下）。
2. OSレベルの権限分離を完全に中止し、永久に実装しない（採用）。

## Decision Outcome
Chosen option: "2. OSレベルの権限分離を完全に中止し、永久に実装しない", because ユーザーからの方針決定に基づく絶対的な制約であり、開発の複雑化を避けるため。

### Consequences
* **Positive**: 運用環境がシンプルに保たれ、Antigravityの既存ツールセットの互換性が完全に維持される。不要な負債を抱え込まずに済む。
* **Negative**: OSレベルの物理的遮断がないため、万が一Node.jsのプロセス権限ごと乗っ取られるような深刻なエクスプロイトが発生した場合は防げないが、本プロジェクトの要件においては許容される。

## Validation Plan
* 今後AIがマルチエージェント化や権限分離を提案する際は、本ADRを根拠としてOSレベルでの分離案を棄却するよう、プロンプトや制約に組み込む。
* `DEBT_AND_FUTURE.md` の将来構想から該当項目を完全に排除する。
