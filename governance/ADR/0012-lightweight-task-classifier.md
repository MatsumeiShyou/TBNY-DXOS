# ADR-0012: Lightweight Task Classifier Integration

* **Status**: Accepted
* **Date**: 2026-04-20
* **Decider**: AI Agent (Antigravity) & User

## Context and Problem Statement
思考の形骸化（Ghost Thinking）を防ぎ、トークン予算と計算リソースを最適化するため、タスクの初動において「思考の重さ」を FAST / HEAVY に分類する構造的なプレ判定が必要であった。

## Decision Drivers
* トークン予算の保全 (B-3)
* 思考統治の厳格化 (Section P)
* 階層型要約による知的資産の回帰防止 (Section X)

## Considered Options
1. 自動判定（AIの内部判断のみ）
2. プロンプト構造としての明示的な出力の強制

## Decision Outcome
Chosen option: "2. プロンプト構造としての明示的な出力の強制", because 思考の過程を物理的な証跡として残し、ユーザーが AI の思考モードを即座に視認できるようにするため。

### Consequences
* **Positive**: FASTタスクの迅速な処理と、HEAVYタスクへのリソース集中が可能になる。
* **Negative**: すべてのタスクの初動で数行の追加出力が必要になり、わずかに出力量が増加する。

## Validation Plan
* タスク着手時の出力フォーマットを Sentinel および `compliance.json` の基準で検証する。
