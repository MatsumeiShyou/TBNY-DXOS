# ADR-0015: nativeFetch.ts の廃止と認証デッドロック回避知見の保全

## ステータス
**承認済み (Accepted)** — 2026-04-29

## コンテキスト

### 問題の経緯
`src/lib/supabase/nativeFetch.ts` は、Supabase JS クライアントの `supabase.auth.getSession()` と `AuthProvider` が競合し、認証処理のデッドロック（画面が永遠に読み込み中になる現象）を引き起こした際の回避策として作成された。

### 回避手法
`nativeFetch.ts` は以下のアプローチを採用していた：
1. Supabase JS SDK の認証フローを完全にバイパス
2. `localStorage` から直接認証トークン（`sb-<project-id>-auth-token`）を取得
3. `fetch()` API で Supabase REST API に直接リクエストを送信

### コードの核心部分（保全対象の知見）
```typescript
// [過去の知見] supabase.auth.getSession() は AuthProvider と競合し
// デッドロックを引き起こすため禁止。
// localStorage から直接トークンを取得するバイパス方式。
const rawStorage = localStorage.getItem('sb-mjaoolcjjlxwstlpdgrg-auth-token');
let token = '';
if (rawStorage) {
    const parsed = JSON.parse(rawStorage);
    token = parsed.access_token || '';
}
```

## 廃止の判断理由
1. **未使用**: プロジェクト内のどのモジュールからもインポートされていない
2. **代替手段の確立**: 現在の `AuthContext.tsx` + `supabase` クライアントの組み合わせで認証フローが安定稼働している
3. **セキュリティリスク**: localStorage の直接操作はトークン漏洩のリスクを高める

## 将来の再発シナリオと対策
以下のシナリオでは、同様のバイパス手法が必要になる可能性がある：

1. **Supabase JS SDK のバージョンアップ**: 認証フローの内部実装が変更された場合
2. **Edge Function 環境**: SDK が使えないサーバーレス環境でのデータアクセス
3. **RLS デバッグ**: Row Level Security の検証で生の HTTP リクエストが必要な場合

→ これらのケースでは、本 ADR を参照し、REST API 直接アクセスのパターンを再構築できる。

## 決定
- `nativeFetch.ts` を削除する
- 知見は本 ADR に保全する
- Supabase クライアント経由のデータ取得を唯一の正規手段とする
