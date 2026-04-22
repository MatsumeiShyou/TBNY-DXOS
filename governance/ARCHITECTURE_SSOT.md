# TBNY DXOS : ARCHITECTURE SSOT (Single Source of Truth)

> [!IMPORTANT]
> **【不変の物理的事実 / Immutable Physical Facts】**
> 本ドキュメントに記載された事項は、プロジェクトにおける「絶対的真実」であり、AIはいかなる推論においてもこれに背く提案をしてはならない。疑義がある場合は、自己判断せずユーザーに Hard Crash（報告）せよ。

## 1. インフラ・データベース構成
- **DOCKER**: **【廃止済み / DEPRECATED】**
  - ローカルでの Docker コンテナ（Supabase Local）の使用は一切禁止。
  - `npx supabase start` や `docker ps` に依存したトラブルシューティングは「統治違反」とする。
- **SUPABASE TARGET**: **【クラウド専業 / CLOUD ONLY】**
  - プロジェクトID: `mjaoolcjjlxwstlpdgrg`
  - API URL: `https://mjaoolcjjlxwstlpdgrg.supabase.co`
- **CONNECTION STRATEGY**: **【IPv4 プーラー経由】**
  - データベース直接接続（ポート 5432）は IPv6 専用のため使用禁止。
  - CLI やスクリプトからの DB 操作は、必ず **ポート 6543 (Transaction Pooler)** を使用せよ。

## 2. 認証・権限
- **SCHEMA**: `staffs` テーブル（OS標準）を SSOT とする。
- **AUTH_ADAPTER**: `AuthAdapter.ts` 経由の解決を唯一の正解とし、直接的な `profiles` テーブル参照等を禁止する。

## 3. 開発環境
- **PORT BINDING**:
  - `TBNY DXOS` (OS Portal): `5173`
  - `RePaper Route` (App): `5174`

---
**[Architecture_Validated: 2026-04-20]**
