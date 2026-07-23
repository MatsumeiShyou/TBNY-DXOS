# Sanctuary Governance Constitution (v9.0)

> **[PLEDGE] 100点の物理証跡なき行動は即時Locker対象。**
> **破壊的な一括削除コマンド（`git clean -fdX` 等）の実行を永久に禁止する。**
> **[LEXICON] 本憲法のルール意図や専門用語（AMP, SDR等）の定義に迷いが生じた場合は、絶対に推測せず直ちに governance/lexicon.json を参照せよ。**

---

## 1. A群：システムによる物理強制 (Physical Enforcement)

> **本章の規則はシステムが自動検査し、違反時はエラーで作業を停止する。**
> 人間やAIの注意力に依存せず、プログラムが客観的に「正しいか誤りか」を判定し強制する。
> 各規則の有効・無効は環境変数 `FORCE_MODE`（全体）および `FORCE_RULE_xxx`（個別）で制御される。
> 設定変更は `scripts/set_force_mode.js` 経由でのみ行い、変更時はAMPLOG.jsonlに自動記録される。

- **[F-SSOT]**: 派生状態の `useState` 保存禁止。`useMemo` による純粋導出を義務とする。
- **[No Leakage & Honesty]**: 秘密情報のハードコード禁止。不明点は「不明」と明示せよ。
- **[SDR Protocol]**: 応答は「事実(State)」「判断(Decision)」「理由(Reason)」の三要素を核とし、比喩を禁止しトップダウン形式で記述せよ。T3時は明示的ラベルで5層分離せよ。
- **[Tier Check]**: ティア判定は `governance/core_config.json` を参照せよ。
  - **T1**: 低リスク。即実行。
  - **T2**: 中リスク。自動テスト合格が承認条件。
  - **T3**: 高リスク。提案→承認（PW:`ｙ`）→実行。AMPLOG(JSONL)への記録（`design_ref` 必須）。
- **[Sanctuary Purge]**: `/push` 提案前に必ず `git status` を確認し、`node .agent/scripts/reflect.js --purge` を実行して不純物を排除せよ。
- **[Boundary Enforcement]**: `apps/` → `features/` → `shared/` の単方向依存を厳守し、無秩序な参照を禁止する。
- **[SVP (Single Version)]**: 全体で同一バージョンのライブラリを使用し、幽霊依存を根絶せよ。

---

## 2. B群：認知と推論による遵守 (Cognitive Compliance)

> **本章の規則はシステムでは検査されない。**
> AIが自らの推論で遵守し、必要な「理由の記述」を人間に代わって代行する。
> システムによる自動化の対象外であり、AIの思考と判断によってのみ守られる。

- **[No Guessing]**: 推測実装禁止。事実(State)なき実装は即時終了せよ。

- **[Root Cause First]**:
  問題解決は根本原因の除去を最優先とする。
  応急処置のみで完了としてはならない。

  AIは問題を検出した場合、次の順序で対応すること。
  1. 根本原因を特定する。
  2. 恒久対策を設計する。
  3. 恒久対策を実装する。
  4. 副作用を検証する。
  5. 再発防止策を確認する。

  応急処置は次の条件をすべて満たす場合のみ許可する。
  - 業務停止を回避する必要がある。
  - データ保護が必要である。
  - セキュリティ事故の拡大防止が必要である。

  応急処置を実施した場合でも、
  - 応急処置であることを明示する。
  - 根本原因を記録する。
  - 恒久対策を必須タスクとして定義する。
  - 恒久対策が完了するまで問題を解決済みとして扱ってはならない。

  以下を恒久対策として扱ってはならない。
  - エラーの隠蔽
  - 警告の無効化
  - コメントアウトのみの回避
  - 設定変更のみの回避
  - 問題の先送り

- **[SSOT Scan]**: 構造不明時はタスク開始時に必ず `npm run agent:scan --target=all` を実行せよ。未実行は完遂ゲートで物理的に遮断される。
- **[GaC Protocol]**: 役割分離（Analyzer/Executor）を遵守せよ。「計画」「設計」の指示時は即座にPLANNINGモードへ復帰せよ。
- **[Physical Verification (CAVR)]**: `governance/core_config.json` に従え。UI/UX変更(Route A)はPreview実機確認必須。バイパス時は `npm run done -- --interactive` で理由を回答し、`DEBT_AND_FUTURE.md` に記録せよ。
- **[C-E-V (Cause-and-Effect)]**: 修正前後で「Negative Proof (失敗再現)」と「Positive Proof (成功証明)」の物理的証跡（テストログ等）を必ず提示せよ。
- **[DOM Observation]**: DOM操作ツール実行前後で `[Loading]`, `[Ready]`, `[Stable]` の3段階状態を物理的に観測・報告せよ。
- **[TGS Trace]**: T3/不具合修正前は `grep_search` 等で `C:\Users\shiyo\.gemini\antigravity\brain\` およびワークスペースを走査し、SDRに明記せよ。
- **[Cognitive Gov]**: ティア比例型の思考ステップを義務付ける。理由なき再設計は制限される。
- **[Cleanup & Type-Check]**: Hooks（`useEffect`等）のロジックを削除・分離した際は、必ずファイル先頭の `import` 文もセットでクリーンアップせよ。また、Lint確認だけでなく、必ず `npm run type-check` を併用してコンパイルレベルでの検証を義務とする。
---

## 3. 実装済み物理強制 (Enforced - Already Implemented)

> **本章の規則は既にシステムスクリプト（closure_gate.js 等）によって物理強制が実装済みである。**

- **[Seal Protocol]**: 実装完了時は必ず単一コマンド `npm run done` を実行し、最終報告の直前に出力されたGSEALコードを引用提示せよ。
- **[Debt Loan]**: `DEBT_AND_FUTURE.md` への記録は「借金」であり、完済するまで関連モジュールの新規機能提案を禁止する。
- **[ADR]**: 統治構造の変更（AGENTS.md等）は必ず `governance/ADR/` に記録せよ。
- **[Zero-Fallback]**: 統治設定読込失敗時はデフォルト値にフォールバックせず、即座に自己破壊（`process.exit(1)`）せよ。判断時は参照キー名を標準出力せよ。

---

## 4. 環境固有ルール (Environment-Specific)

- **[SQL Sync]**: スキーマ変更時は必ず `npx supabase db diff` を実行し、生成SQLを提示せよ。変更内容は即時 `SCHEMA_HISTORY.md` に記録せよ。
- **[Supabase Connection]**: CLI実行や直接接続前に、必ず `knowledge/supabase_cli_ipv6_pooler_fix/artifacts/manual.md` を読み込み遵守せよ。