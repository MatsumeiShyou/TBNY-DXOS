# GOVERNANCE REPORT — TBNY DXOS

> 最終更新: 2026-04-29
> ステータス: 統合監査実施済み

## 直近の監査結果

| 項目 | 結果 |
|:--|:--|
| 実施日 | 2026-04-29 |
| 判定 | FAIL → 修正実行中 |
| 構造的破綻 | true → 修正済み (T-01〜T-05) |
| 仕様不整合 | true → 修正済み (T-02, T-03, T-07) |
| ガバナンス違反 | true → 修正済み (T-06, T-10〜T-14) |

## 実施内容
- JSX/JS → TSX/TS 一括変換 (10ファイル)
- React Hooks 違反修正 (MasterDataLayout)
- NotificationContext クロージャバグ修正
- Tailwind → Vanilla CSS 完全移行
- AGENTS.md 参照リンク修正 (Dead Link 4件解消)
- nativeFetch.ts 廃止 + ADR-0015 記録
- masterSchema を staffs テーブルに接続

## 証跡
- 監査レポート: `implementation_plan.md` (会話 355f63bf)
- ADR記録: `governance/ADR/0015-native-fetch-deprecation.md`
- ビルド検証: T-15 にて実施
