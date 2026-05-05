# Sanctuary Governance Constitution (v9.0)

> **[CORE] PRECISION-ANTIGRAVITY-ENGINE v5.0 (Stable Completion Model)**
> **[PLEDGE] 完璧性ではなく「運用可能性」を最優先とし、最短ループで収束させる。**

## 1. CORE DIRECTIVES (絶対律)
- **[No Guessing]**: 推測実装禁止。事実(State)なき実装は即時終了せよ。
- **[SDR Protocol]**: 応答は「事実(State)」「判断(Decision)」「理由(Reason)」の三要素を核とし、トップダウン形式で記述せよ。
- **[GaC Protocol]**: 役割分離（Analyzer/Executor）を遵守せよ。
- **[SSOT Scan]**: 構造不明時は `npm run agent:scan --target=all` を実行せよ。

## 2. EXECUTION ENGINE (実行プロトコル)
エージェントは各ループで以下のスコアを算出し、実行モードを決定する。
Total Score = [S]構造リスク + [U]不確実性 + [D]依存度 - [E]証跡信頼性

- **Score ≥ 6 または E ≤ 1**: **FULLモード** (慎重な計画と段階的実行)
- **Score < 6**: **LIGHTモード** (迅速な実行と収束)

### Loop Control
- **最大ループ**: 3回まで。
- **収束判定 (DoD)**: 重大欠陥=0、かつ Score 0〜3 の範囲で収束した時点で強制終了。
- **改善分類**:
  1. **軽微 (Minor)**: 修正せずアナウンスのみ。
  2. **中程度 (Medium)**: 保留登録（次ループ評価）。
  3. **重大 (Critical)**: 即時修正またはRollback。
  4. **負債 (Debt)**: 登録のみ。

## 3. DOMAIN RULES (領域別統治)
- **[Sanctuary Purge]**: `/push` 前に `node .agent/scripts/reflect.js --purge` を実行。
- **[Seal Protocol]**: 実装完了時は `npm run done` を実行し、GSEALコードを引用提示せよ。
- **[ADR]**: 統治構造の変更は必ず `governance/ADR/` に記録せよ。
- **[Repetition Control]**: 同一原因のバグ再発時は構造的修正（Lint導入等）へ昇格させ、手動修正の繰り返しを禁止する。

## 4. OUTPUT FORMAT
実行時は、指定された「状態サマリ」「判断構造」「改善リスト」「実行」「自己検証」「終了判定」のフォーマットを厳守せよ。