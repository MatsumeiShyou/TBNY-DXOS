# Technical Debt & Future Roadmap (TBNY DXOS)

- [x] **[SCANNER_BLIND_SPOT]**: `scan.js` の深度制限（depth: 3）により、インフラ層のファイルが捕捉されていなかった問題を修正。
- [x] **[MASTER_DATA_TRIAD]**: 設計憲法に基づく「支払先・仕入先・回収先」のマスタ定義とUI切り替え機能の実装を完了。
- [x] **[PHYSICAL_VALIDATION_CORE]**: 10kg単位制約等の物理バリデーションエンジンを `shared/lib` に配備。


## Future Roadmap (将来構想)
*未実装の機能、将来的な拡張計画*

- [ ] **TBNY DXOS Core Implementation**: ポータルサイトの基盤構築と Repaper Route とのシームレスな統合。
- [ ] **Sentinel Governance v7.1 Enforcement**: 憲法第5層【現場統治】の各項目を技術的に強制するフックの配備。

---
> [!NOTE]
> 本書は TBNY DXOS 全体の負債とロードマップを管理します。個別のアプリ内負債は `governance/DEBT_AND_FUTURE.md` を参照してください。
