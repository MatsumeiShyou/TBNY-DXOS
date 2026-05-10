# Technical Debt & Future Roadmap (TBNY DXOS)

## [Resolved] 2026-05-10: Driver App Integrity Restoration
- **Remediation**: Fixed UTF-8 mojibake in critical driver pages (`NumericKeypad`, `EndShiftPage`, etc.) causing runtime crashes.
- **UI Refinement**: Resolved overlapping inputs and scroll lock issues in `FuelPage` by refactoring to a 100vh layout with `border-box` sizing.
- **Verification**: 100% build pass and physical DOM verification completed (GSEAL issued).

## Technical Debt (残存負債)
- [ ] **[PWA_ASSET_DEBT]**: `manifest.json` のアイコンが `vite.svg` の暫定流用。正式なアセット生成と差し替えが必要。
- [ ] **[MODULE_INTEGRATION_DEBT]**: RePaper Route 等の外部モジュールとの物理的な統合（リンク、データ連携、SSO）。現在 Portal 側からの並行起動を復旧済み。
- [ ] **[SWR_FULL_ADOPTION]**: 全データフェッチ層への `useSWR` パターンの導入（オフライン耐性の強化）。


## Future Roadmap (将来構想)
- [ ] **TBNY DXOS Core Implementation**: ポータル基盤と各モジュールのシームレスな統合（SSO含む）。
- [x] **[DEVOPS_FIX]**: 開発サーバー並行起動の復旧 (2026-05-01)。
- [ ] **Sentinel Governance v8.x Protocol Enforcement**: `Seal/Purge Protocol` の完全自動監視。

---
> [!NOTE]
> 本書は TBNY DXOS 全体の負債とロードマップを管理します。個別のアプリ内負債は `governance/DEBT_AND_FUTURE.md` を参照してください。

## 2026-05-05: 構造的防護と静的解析の強化
- **対策**: `ErrorBoundary` の導入（LazyWrapper 単位）と `consistent-type-imports` ルールの強制。
- **目的**: インターフェースの値インポートに起因する SyntaxError（ホワイトアウト）の根絶。
- **リスク管理プロトコル**:
    - **[差分制御]**: 全ファイルへの一括適用（auto-fix）は禁止する。修正・追加したファイルから順次適用することで、Git 履歴の健全性を保つ。
    - **[観測維持]**: `ErrorBoundary` は `console.error` にスタックトレースを排出し続ける。将来的に SWR/Supabase 経由でのサーバーサイドログ出力を検討。
    - **[ビルド摩擦]**: `tsconfig.app.json` の `incremental: true` を維持し、型チェックによる待ち時間を最小化する。
    - **[React インポート]**: `verbatimModuleSyntax: true` 環境下では、JSX を使用し `React.FC` 等を参照する場合、`import React from 'react'` の明示的なインポートが必須となる（React 19 以降でもランタイムエラーを避けるため）。
