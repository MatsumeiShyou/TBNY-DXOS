# ADR 010: DB Schema Alignment for daily_jobs (Plan A)

## Date
2026-08-26

## Status
Accepted

## Context
フロントエンドの `storageService.ts` には、Supabaseの `daily_jobs` テーブルに日次配車データを保存・復元するロジックが既に実装されていました。しかし、このロジックはUIの動作要件に基づいて `front_id`、`vehicle_id` (画面上のコースID如き `d1`, `d2`)、`sequence_order` といったカラムに依存していましたが、データベース側 (`001_initial_schema.sql`) にはそれらのカラムが存在していませんでした。
その結果、Supabaseへの `saveDailyState` が `400 Bad Request` となり、ローカルのJSON保存へのフォールバックが発生していました。

## Decision
UI側の要件（ドラッグ＆ドロップで扱うための識別子 `front_id` や、固定文字列ベースのコースID `vehicle_id`、順序 `sequence_order`）に合わせて、データベーススキーマを拡張すること（A案）を決定しました。

```sql
ALTER TABLE daily_jobs
  ADD COLUMN front_id VARCHAR(100),
  ADD COLUMN vehicle_id VARCHAR(50),
  ADD COLUMN sequence_order INTEGER;
```

## Reason
- B案（UIを完全なUUIDベースの `master_vehicles` と `master_workers` に書き換える）を採用した場合、ハードコードされた `INITIAL_DRIVERS` に依存している配車盤のUIレンダリングやドラッグ＆ドロップロジック全体の大規模な改修が必要となり、リスクが高いと判断しました。
- 既存の `storageService.ts` は既にA案のデータ構造に沿って完成しているため、DBスキーマ側に不足しているカラムをVARCHAR等で緩やかに受け入れるだけで、即座に保存・復元処理（永続化）を稼働させることができます。

## Consequences
- **Positive**: 日次配車計画（daily_jobs）が正常にSupabaseへ保存されるようになり、将来のリアルタイム同期や実績入力（Step 3）への連携が可能となります。
- **Negative/Risk**: `vehicle_id` は `VARCHAR(50)` として追加されるため、現状では `master_vehicles` テーブルとの厳密な外部キー制約（Foreign Key）を持たず、アプリケーションレイヤーでの整合性担保が必要になります。将来的に完全なリレーショナルモデルへ移行する際にデータマイグレーションが必要になる可能性があります。
