# Technical Debt & Future Roadmap (TBNY DXOS)

## Technical Debt (技術的負債)
*解決すべき技術的課題、リファクタリング対象*

- [ ] **[UI_QUALITY_DEBT]**: ウィジェットの不整合による DXOS Portal 関連 UI の目視確認。プッシュ前は環境 Route A 経由でチェック。
- [ ] **[DB_RPC_DEBT]**: `useMasterCRUD.ts` で使用する RPC `rpc_execute_master_update` の DB 側存在確認および WRITE テストが未実施。DB側の実装が必要。
- [ ] **[PWA_ASSET_DEBT]**: `public/manifest.json` で使用しているアイコンが `vite.svg` の暫定流用。正式なアセット生成と差し替えが必要。

## Future Roadmap (将来構想)
*未実装の機能、将来的な拡張計画*

- [ ] **TBNY DXOS Core Implementation**: ポータルサイトの基盤構築と Repaper Route とのシームレスな統合。
- [ ] **Sentinel Governance v7.1 Enforcement**: 憲法第5層【現場統治】の各項目を技術的に強制するフックの配備。

---
> [!NOTE]
> 本書は TBNY DXOS 全体の負債とロードマップを管理します。個別のアプリ内負債は `governance/DEBT_AND_FUTURE.md` を参照してください。
