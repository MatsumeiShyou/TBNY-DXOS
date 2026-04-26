# ADR-0002: 憲法 (AGENTS.md) のスリム化と GaC への完全委譲

* **Status**: Accepted
* **Date**: 2026-03-08
* **Decider**: AI Agent (Antigravity) & User

## Context and Problem Statement
v5.0 の `AGENTS.md` は 700 行を超え、OS 固有のコマンド (Windows PowerShell の制約等) や完了手順が混在していました。
これにより、AI の認知負荷が増大し、ルールの見落としや解釈ミスが発生する「統治の脆弱さ」が露呈していました。

## Decision Drivers
* 憲法の不可侵性と純粋性の維持
* 環境依存ロジックの物理的隠蔽 (GAL)
* 機械可読なルールによる自動検証の強化

## Considered Options
1. **案 1**: Markdown への詳細追記を継続 (700 行超)
2. **案 2**: 哲学・原則と、実行ロジック (GaC) の完全分離 (50 行程度へのスリム化)

## Decision Outcome
Chosen option: "**案 2**", because 技術的手順を JSON/コードへ委譲することで、AI の「解釈」という不確実な工程を排除し、環境適合を `govCore` に一任できるため。憲法は「何をすべきか（原則）」に専念し、「どう実行するか（技術）」は GaC 層が担保する。

### Consequences
* **Positive**: 憲法の可読性が劇的に向上。環境エラー (tail 問題等) の再発防止。
* **Negative**: ルール構成の階層化により、新規参画者 (または別の AI) が詳細を追う際に複数ファイルを参照する必要がある。

## Validation Plan
- `AGENTS.md` v5.1 が 60 行以下に収まっていること。
- 新設した `/governance` ディレクトリへの正常なリンク。
- `pre_flight.js` 等のスクリプトが新設された GaC ルールに基づき正常動作すること。
