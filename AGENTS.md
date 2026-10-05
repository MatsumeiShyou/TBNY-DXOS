# TBNY-DXOS AI Governance & Routing

**【重要】このファイルはAIの行動を規定する最高憲法です。作業着手前に必ず熟読してください。**

## 1. 境界防衛型の掟（絶対禁止事項）
本プロジェクトは、過去の依存地獄（モノレポの失敗）を防ぐため、厳格な「境界防衛型」を採用しています。各掟がどの層で物理的に強制されているかは「4. 物理強制の実装状況」を参照してください。

1. **ルートの純化**: ルートディレクトリに `dependencies`、`workspaces`、`package-lock.json`、`node_modules` を追加することは**絶対に禁止**します。（境界マーカーとしての `private: true` の空ファイルは許容されます）
2. **共有パッケージの禁止**: `packages/` などの共有ディレクトリを作ることは禁止です。複数アプリでコードを再利用したい場合、UIコンポーネントは `apps/_template/` から対象アプリへコピペしてください。ただし、**DB型定義やセキュリティ修正の手動コピーは厳禁**です。
3. **作業範囲の完全分離**: UIの変更は対象アプリ（例: `apps/repaper/`）のディレクトリ内で完結させてください。`../../` などの越境インポートはビルド時に遮断されます。
4. **DBの波及ルール**: `db/` を変更した際は、必ず全アプリの型再生成と検査を実施してください。また、既存のマイグレーションファイル（`db/**/migrations/*.sql` と `scripts/NNN_*.sql`）の編集・削除は拒否されます（新規追加のみ許可）。

## 2. アプリケーション対応表（ルーティング）
タスクを指示された場合は、推測せずに以下の対応表に従って対象ディレクトリに移動してから作業を開始してください。
（※この表は実在の `apps/*/package.json` と一致させてください。現時点では自動検査はありません）

| 呼称・旧名称 | 対象ディレクトリ（作業開始位置） |
| :--- | :--- |
| 回収アプリ (repaper) | `apps/repaper/` |
| データベース・Supabase | `db/` |

※ 対象アプリが不明な場合や複数該当する場合は、決して推測でコードを書かず、人間に質問してください。

## 3. 歴史と進化の背景
* 本プロジェクトは元々単一の「回収アプリ」でしたが、将来的な複数アプリ展開に向けて「TBNY-DXOS」へと進化しました。
* npm workspaces等を用いた依存共有は、過去にビルド破壊とリポジトリのデッドロックを引き起こしたため、あえて「すべてを物理的に分ける（境界防衛）」構造を採用しています。

## 4. 物理強制の実装状況
ここには**実際に強制されていること**だけを書きます。強制の層は、突破できる者が少ない順に L5 → L1 です。

| 層 | 仕組み | 強制内容 |
| :--- | :--- | :--- |
| L1/L2 Claude Code | `.claude/settings.json` のフック（`.claude/hooks/`） | **拒否**: ルート許可リスト外への書き込み、ルートの `package-lock.json`・`node_modules`・依存追加、`packages/`、`generated/` の直接編集、既存マイグレーションの編集、`--no-verify`、`core.hooksPath` の変更、緊急バイパス、ACL 操作、強制 push、`CLAUDECODE` の改変<br>**人間の承認**: 統治ファイル（`.claude/` `.agents/` `.githooks/` `.github/` `governance/` `AGENTS.md` `CLAUDE.md` `db/AGENTS.md`）の変更、`Waiver:` 付きコミット、`reset --hard`・再帰削除・破壊的 SQL・push<br>**編集後検査**: アプリ内の編集ごとに ESLint（エラー）と型チェックを実行し、結果を AI に返す |
| L3 git | `.githooks/pre-commit`（`dispatch.cjs`） | ルート許可リスト（`governance/root_allowlist.json`）、マイグレーション追記のみ、`generated/` と `db/shared/` の一致、期限切れ負債、影響アプリの ESLint エラーと型チェック |
| L3 git | `.githooks/commit-msg`（`.agents/scripts/verify-task.cjs`） | コミット種別の必須化、一時ファイル混入の拒否、保護パス（`Waiver:` で免除）、`fix:` の fail-before / pass-after テスト検証 |
| L4 ビルド・CI | vite の境界監査プラグイン、GitHub Actions | アプリ外ファイルのバンドル拒否／型・lint・テスト・ビルド |
| L5 OS | `scripts/governance_lock.ps1`（人間が UAC で実行） | 統治ファイルへの書き込みを NTFS ACL で拒否（**施錠時のみ**） |

* `.agents/hooks.json` と `.agents/scripts/` の書き込み・コマンド検査は Antigravity 用であり、**Claude Code では動作しません**。
* AI は L3 を `--no-verify` で迂回できる立場にあるため、L1/L2 でそれを禁止しています。最終防衛線は L4（ブランチ保護）と L5（ACL 施錠）です。
