# ADR 004: Governance v10.0 — 曖昧さの排除と物理強制の実態同期

## Status
Accepted

## Context
AGENTS.md v9.0 の運用中に、以下の問題が顕在化した。

1. **READMEの更新漏れ**: `[SSOT Sync Protocol]` はルールとして記述されていたが、「いつチェックするか」のトリガーが明示されておらず、AIが完了報告前にスキップした。
2. **GSEAL発行漏れ**: `[Seal Protocol]` は「最終報告の直前に」と記述されていたが、`done.js` は事前条件を何もチェックしないため、ルールの実効性がなかった。
3. **存在しないシステムへの参照**: A群冒頭に `FORCE_MODE` 環境変数と `set_force_mode.js` への参照があったが、これらは一度も実装されておらず、AGENTS.md 自体の信頼性を損なっていた。
4. **定義なきルール**: `[Cognitive Gov]` は「ティア比例型の思考ステップ」を義務付けていたが、思考ステップの定義が存在せず、遵守も違反も判定不能だった。
5. **適用範囲の不明確さ**: `[C-E-V]` が全ティアに適用されるように読めたため、テキスト1文字の変更にも「失敗再現ログ」が必要になる矛盾があった。

ユーザーの指示により全条項を精読し、「曖昧な指示を具体的な手順に落とし込む」方針で統治構造の見直しを実施した。

## Decision
以下の変更を AGENTS.md v10.0 として適用する。

### 物理強制の実態同期
- A群冒頭の `FORCE_MODE` / `set_force_mode.js` への参照を削除し、実在するスクリプト群への参照に置き換え
- `done.js` に事前チェック（build確認、README同期確認、git status確認）を追加（警告レベル）
- `scan.js` にドキュメント存在チェックを追加

### 認知ルールの具体化
- `[SSOT Scan]`: 「構造不明時」→ 常時実行 + チェック内容の明示
- `[GaC Protocol]`: Analyzer/Executor の責務を具体的に定義
- `[Cognitive Gov]`: 削除（`[Root Cause First]` + `[Tier Check]` と重複）
- `[C-E-V]`: Adaptive Verification Level C以上に適用範囲を限定
- `[SSOT Sync Protocol]`: チェックタイミングを3段階で明示
- `[Future Tasks Reflection]`: 記録対象の粒度基準を3条件で明示

### 新規追加
- `[Post-Execution Audit]`: `npm run done` 実行前の監査チェックリスト

## Consequences
- **Positive:** ルールと物理層の矛盾が解消され、AGENTS.md の信頼性が回復する。曖昧な命令が具体的な手順に変わることで、AIの解釈ブレによるプロトコル違反が構造的に防止される。
- **Negative:** ルール数は微減（Cognitive Gov削除）するが、各ルールの文量は増加するため、AGENTS.md 全体のバイト数は増加する。
