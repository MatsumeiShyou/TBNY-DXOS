# Supabase CLI 接続不全の真因と回避マニュアル

## 1. 発生する問題（兆候）
ローカル環境から Supabase の DB に接続する際（`supabase db push` やスクリプト経由など）、以下のようなエラーで進行が完全にブロックされる。
- `TCP connect to [IPv6 address]:5432 failed`
- `connectex: No connection could be made because the target machine actively refused it.`
- `ENOTFOUND` または `TimedOut`

## 2. 不通の「真因」と環境による差異
これは、ファイアウォールなどの「一時的なエラー」ではありません。Supabase のインフラ仕様変更とローカル環境ネットワークのプロトコルの不一致が原因です。
1. **直接接続の IPv6 専業化トレンド**: Supabase は、`db.[project-id].supabase.co` への DB 直接接続（ポート 5432）を **IPv6 専用** へと移行しています（専用IPv4アドレスの付与は有料プランのみ）。
2. **ローカル環境の IPv4 制限**: 一般的な Wi-Fi や設定の古いネットワークでは IPv6 パケットのアウトバウンド・ルーティングが機能しないことが多く、ホスト名解決はできても TCP 接続自体が物理的にドロップ（タイムアウト）されます。

> [!CAUTION]
> **【重要】環境別の接続可否について（Pooler誤認防止）**
> `db.mjaoolcjjlxwstlpdgrg.supabase.co:5432` への直接接続は、現在のネットワーク環境においては **IPv4 で正常に通信できる** 状態です。
> 接続に失敗した際、直ちに「IPv6制限だからPooler（ポート6543）を使わなければならない」と**短絡的に誤認・推測しない**でください。まずは通常の直接接続（ポート5432）を試し、明らかなプロトコル起因のタイムアウトが発生した場合にのみ、Poolerの利用を検討してください。

> [!WARNING]
> データ API サーバー (`mjaool...` 等の Cloudflare 経由 IP) は IPv4 を持っていますが、セキュリティ上 5432 ポートは閉塞されています。「API の IP で 5432 を叩く」という回避策は成立しません。

## 3. 代替策（IPv4 共有プーラーの利用）
直接接続（ポート5432）がIPv6制限等により物理的に不可能な環境に限り、Supabase が公式かつ無料で提供している **「共有コネクションプーラー (Supavisor)」** を中継させる代替策を適用します。このプーラーは **IPv4 での接続を許容** しています。

### [手順 1] プーラー URL の取得
Supabase Dashboard から以下を開き、URL を取得します。
- URLの場所: **[Project Settings] -> [Database] -> [Connection string] -> [ORM]**
- 形式: `postgresql://postgres.[project-id]:[password]@aws-X-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
- **重要基準**: 2つある URL のうち、必ずポートが **`6543`** になっている方（Transaction Pooler モード）を使用してください。

### [手順 2] CLI / プログラムからの執行
エージェントが自律的に SQL やマイグレーションを実行・確認する際は、名前解決エラーを引き起こす CLI のデフォルト挙動を避け、**明示的にプーラー URL を指定するか、Node.js の `pg` クライアントを直接使用** してください。

#### パターン A: Node.js (`pg`) クライアントを使用 (★推奨・最高安定)
CLI のバージョン依存や実行時のネットワーク変数をすべて排除した、最強の自律アプローチです。
```javascript
import pg from 'pg';
// URLのパスワード部分は .env 等から取得して安全に結合すること
const connectionString = 'postgresql://postgres.[project-id]:[PASSWORD]@aws-X-[region].pooler.supabase.com:6543/postgres?pgbouncer=true';

const pool = new pg.Pool({ connectionString });
await pool.query('YOUR SQL HERE');
```

#### パターン B: Supabase CLI で引数強制
```bash
npx supabase db push --db-url "postgresql://postgres.[project-id]:[PASSWORD]@aws-X-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## 4. エージェント行動規範 (Agent Directive)
今後の開発において、Supabase データベースに対する操作（マイグレーション、データ同期、整合性確認）でネットワーク起因のエラー・不明確な結果に直面した場合、エージェントは直ちにローカルの CLI 環境への固執を捨てること。
このマニュアルに則り、**「IPv4 プーラー経由の Node.js (pg) 執行」** に戦術を切り替え、自律的にタスクを完遂させなければならない。
