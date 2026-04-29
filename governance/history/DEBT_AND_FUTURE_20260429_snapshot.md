# Technical Debt & Future Roadmap (TBNY DXOS)

- [x] **[SCANNER_BLIND_SPOT]**: `scan.js` の深度制限修正（完了）。
- [x] **[MASTER_DATA_TRIAD]**: Payer/Supplier/Location 実装（完了）。
- [x] **[PHYSICAL_VALIDATION_CORE]**: 物理バリデーションエンジン配備（完了）。

## Technical Debt (残存負債)
- [ ] **[PWA_ASSET_DEBT]**: `manifest.json` のアイコンが `vite.svg` の暫定流用。正式なアセット生成と差し替えが必要。
- [ ] **[MODULE_INTEGRATION_DEBT]**: RePaper Route 等の外部モジュールとの物理的な統合（リンク、データ連携、SSO）の未完了。
- [ ] **[SWR_FULL_ADOPTION]**: 全データフェッチ層への `useSWR` または `useQuery` パターンの導入（オフライン耐性の強化）。


## Future Roadmap (将来構想)
- [ ] **TBNY DXOS Core Implementation**: ポータル基盤と各モジュールのシームレスな統合。
- [ ] **Sentinel Governance v8.x Protocol Enforcement**: `Seal/Purge Protocol` の完全自動監視および物理証跡の 100% 保証。

---
> [!NOTE]
> 本書は TBNY DXOS 全体の負債とロードマップを管理します。個別のアプリ内負債は `governance/DEBT_AND_FUTURE.md` を参照してください。
