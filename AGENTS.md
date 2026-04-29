# Sanctuary Governance Constitution (v7.1)

> [!IMPORTANT]
> **【サンクチュアリ誓約 / Sanctuary Integrity Pledge】**
> **「いい加減な統治」は今後一切、一秒たりとも許容されない。**
> すべてのエージェントのアクションは、100点満点の物理的証跡（C-E-V / Sanctuary Purge / Zero-Tolerance）を満たすことを「最低条件」とする。妥協、推測、残存物の漏洩は、即座に統治ロック（Locker）の物理対象となる。
> **また、`git clean -fdX` 等、特定ファイルの保護（White-list）を持たない破壊的な一括削除コマンドの実行を永久に禁止する。**

## 第1層【絶対律】— 常時適用・不可侵

### A. 優先順位
```
絶対律（第1層） > 実行ゲート（第2層） > 効率
```

### B. 不可侵原則
- **B-1 AMP**: T3 変更は 提案→承認（PW:`ｙ`）→実行。自己判断回避は厳禁。
- **B-2 SDR+Risk**: T3のみ5層分離（SDR+Risk）を義務とする。
- **B-3 思考リソース管理**: 英語による思考（Token 保全）と、日本語による成果物（品質担保）のハイブリッド運用を絶対律とする。
- **B-4 F-SSOT**: 派生状態の `useState` 保存禁止。`useMemo` による純粋導出を義務とする。

### C. 行動原則 (Core4)
- **C-1 No Leakage / C-2 Honesty / C-3 No Guessing / C-4 GaC Protocol**
- **Roles**: Analyzer (Planning) / Executor (Execution) の厳格な役割分離。

---

## 第2層【実行ゲート】— リスク比例型ワークフロー
詳細な判定基準と制限事項は [core_config.json](file:///governance/core_config.json) の `risk_matrix` および `compliance` セクションを正典とする。

### D. リスクティアとGaC連携
- **判定要約**: T1 (低リスク/即実行) / T2 (中リスク/自律修正) / T3 (高リスク/人間承認)。
- **[Ref]**: `governance/core_config.json` > `risk_matrix`

### E. 物理検証プロトコル (CAVR)
- **検証要約**: Route A (UI修正: Preview必須) / Route B (ロジック) / Route C (ドキュメント) への経路分岐。
- **[Ref]**: `governance/core_config.json` > `compliance`

---

## 第3層【メタ統治】— 構造の維持
統治資産の変更管理と完遂定義。詳細は [core_config.json](file:///governance/core_config.json) の `closure_conditions` セクションを参照。

### F. ADR (Architecture Decision Records)
- **要約**: 統治構造の変更（AGENTS.md, /governance/ 等）は必ず `ADR/` に背景を記録せよ。
- **[Ref]**: `governance/ADR/`

### G. 完遂プロトコル ([TASK_CLOSED])
- **要約**: `npm run done` による物理的な完遂（SEAL / Walkthrough / Reflection）を義務とする。
- **[Ref]**: `governance/core_config.json` > `closure_conditions`

---

## 第4層【自己進化】— 検証と再発防止
検証証跡と思考の質の担保。詳細は [thought_rules.json](file:///governance/thought_rules.json) を参照。

### K. Cause-and-Effect Verification (C-E-V)
- **要約**: 推測を排除し、Negative / Positive 両面の物理的証跡（テストログ等）を提示せよ。

### N. 統治整合性 (Governance Alignment)
- **要約**: Zero-Fallback 原則。定義の欠落時は Hard Crash せよ。

### P. 思考統治 (Cognitive Governance) [Crucial]
- **P-1 Lightweight Task Classifier**: 着手時に FAST / HEAVY を分類せよ（迷ったら HEAVY）。
- **P-2 Output Order**: 1. Classifier -> 2. Reflection Gate -> 3. (T3時) SDR+Risk。
- **[Ref]**: `governance/thought_rules.json`

---

## 第5層【現場統治】— TBNY DXOS 統合条項
DOM, SQL, SDR に関する技術的規範。詳細は [dxos_integrated_rules.json](file:///governance/dxos_integrated_rules.json) を参照。

### Q. DOM観測 / R. データベース整合性 / S. 推論と負債
- **要約**: 三連星報告、Strict SQL Sync、SDR Append-only、DEBT 借金認定。
- **[Ref]**: `governance/dxos_integrated_rules.json`

---

## 第6層【応答スタイル統治】
詳細な形式については [response_rules.json](file:///governance/response_rules.json) を遵守せよ。

### T. 応答スタイル原則 (Response Style Protocol)
- **要約**: SDR 内包、比喩禁止、情報高密度化（結論優先）、具体的ナビゲーション。

---

## 第7層【モノレポ・過去知性】
- **U. 境界の不透過性 / V. SVP / X. TGS 執行プロトコル**
- 過去の失敗回帰を零（Zero）にする走査と、モノレポ境界のガードを物理的に強制せよ。

---
**[Sanctuary_Integrity: Distributed]**
: すべての詳細ルールは構造化データへ移譲された。AI は `govCore` を介してこれらを常に最新の状態として参照せよ。