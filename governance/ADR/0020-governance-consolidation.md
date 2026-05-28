# ADR-0020: 統治機構のスリム化と二重管理の解消 (Governance Consolidation)

## 1. 事実 (State)
- `governance/risk_matrix.json` と `governance/compliance.json` の内容が、`governance/core_config.json` の内部に完全に重複して定義（二重管理）されていた。
- `AGENTS.md` の記述（`governance/rules/compliance.json`）と実際のファイルパス（`governance/compliance.json`）に不一致が生じていた。
- `load_governance.js` がディレクトリ内のすべてのJSONを読み込む仕様であるため、この重複がAIに同じルールを2回ロードさせ、認知負荷とトークン消費を増大させていた。

## 2. 判断 (Decision)
- **A案（統合派）** を採用し、重複する個別のJSONファイル（`risk_matrix.json`, `compliance.json`）を削除する。
- 統治設定のSSOTを `governance/core_config.json` へ集約する。
- `AGENTS.md` の参照パスを `governance/core_config.json` へ書き換える。

## 3. 理由 (Reason)
- 統治のスケーラビリティ（GaC）を維持するためには、AIの認知空間（Context）をクリーンに保つことが不可欠である。
- ファイルの断片化による「思考の追いつかなさ（認知限界）」を軽減し、人間とAI双方の管理コストを低下させるため。
- SSOTの原則（単一真実源）を徹底し、矛盾の発生を構造的に防ぐため。

## 4. リスク (Risk)
- `gov_core.js` やその他のスクリプトが、明示的に `risk_matrix.json` というファイル名に依存している場合、実行時エラーが発生する可能性がある。
- ※対策: Phase 1 の調査（grep等）で、`.agent/scripts/` 内部にハードコードされたファイル名依存が存在しないことを確認済み。`core_config.json` 内のキー（`risk_matrix`, `compliance`）から動的に値を取得できるため、問題はないと評価。

## 5. 未知 (Unknown)
- `governance/environment.json` が欠損しているが、これはデフォルト値でフォールバックするため現状は無視している。今後、さらにJSONの統合を進めるかの議論は保留とする。
