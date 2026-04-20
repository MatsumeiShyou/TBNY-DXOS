# ADR-0013: 統治構造の外部化（Governance-as-Data）と憲法のスリム化

* **Status**: Accepted
* **Date**: 2026-04-20
* **Decider**: AI Agent (Antigravity) & User

## Context and Problem Statement
AGENTS.md v7.0 は 170 行を超え、AI の推論時に多大なトークンを消費していた。また、技術的な詳細（判定基準や具体的な文言ルール）が自然言語で記述されていたため、AI の解釈に「揺れ」が生じるリスクがあった。

## Decision Drivers
* AI の推論コスト削減とレスポンス速度の向上
* ルールの「解釈」から「参照」への移行による精度 100% 担保
* 憲法の純粋性（不動の原則）と法律の柔軟性（外部データ）の分離

## Considered Options
1. **案A**: `AGENTS.md` への直接追記を継続
2. **案B**: 詳細ルールを `/governance/*.json` へ外部構造化し、`AGENTS.md` は原則とポインタのみにする（Distributed Governance）

## Decision Outcome
Chosen option: "**案B**", BECAUSE 構造化データ（JSON）は AI にとって曖昧性のない「正典」として機能し、`govCore` 等のツールを介して物理的に強制（Enforce）することが容易であるため。憲法（AGENTS.md）を 50 行以下にスリム化することで、コンテキストの解釈精度を極大化する。

### Consequences
* **Positive**: コンテキストウィンドウの節約、ルール適用の厳格化。
* **Negative**: ルールの全容を把握するために複数の JSON 参照が必要（AI はツール出力を経由するため、このデメリットは無視可能）。

## Validation Plan
1. `AGENTS.md` が原則ベースのポインタ形式に更新されていること。
2. `risk_matrix.json`, `thought_rules.json`, `response_rules.json`, `dxos_integrated_rules.json` が正しく構成され、インベントリに登録されていること。
3. `pre_flight.js` 等の既存スクリプトが、外部化されたルールを参照して正常に動作すること。
