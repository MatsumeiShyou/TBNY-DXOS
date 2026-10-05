# Antigravity 2.0 用の統治スクリプト（2026-10-05 退役）

Claude Code へ移行したため、Claude では動作しない／どこからも呼ばれていない統治の仕組みをここへ移しました。
削除ではなく移動なので、必要になれば元の場所へ戻せます（ディレクトリ構成は元のパスのまま）。

| ファイル | 元の役割 | 退役理由 |
| :--- | :--- | :--- |
| `.agents/hooks.json` と `.agents/scripts/` の `write-safety-check` `safety-check` `post-write-check` `anomaly-lock-hook` `hook-observer` | Antigravity のツールフック | Antigravity のツール名・入力形式専用。Claude 版は `.claude/hooks/` |
| `.agents/scripts/scope_hook.js` `resolve-app.mjs` `.agents/lib/` | 上記フックの補助 | 同上 |
| `.agents/scripts/closure_gate.js` `commit-msg-hook.js` `reflect.js` | 完了ゲート等 | どこからも呼ばれていない（モノレポ移行前の `src/` 前提） |
| `scripts/check_tier_paths.mjs` `scripts/set_force_mode.js` | ティア検査・強制モード切替 | どこからも呼ばれていない |
| `.husky/commit-msg` | Debt トレーラー検査 | `core.hooksPath=.githooks` のため実行されていなかった |
| `.agents/hook-events.jsonl` | hook-observer のログ | 記録の大半が `tool: unknown` で、観測対象も退役 |

現在の物理強制の全体像はリポジトリ直下の `AGENTS.md`「4. 物理強制の実装状況」を参照してください。
