---
name: react-vite-dev
description: >-
  React 19 + Vite + Tailwind CSS v4 プロジェクトのコンポーネント開発・ビルド・
  デバッグ時に使用する。状態管理パターン、依存方向ルール、Viteのローカル
  APIミドルウェア構成を含む。
---

# React 19 + Vite + Tailwind CSS v4 開発ガイド

## 技術スタック

| ライブラリ | バージョン | 用途 |
|---|---|---|
| React | ^19.1.0 | UIフレームワーク |
| React DOM | ^19.1.0 | DOMレンダリング |
| Vite | (@vitejs/plugin-react ^4.5.2) | ビルドツール |
| Tailwind CSS | ^4.1.10 (@tailwindcss/vite) | ユーティリティCSS |
| lucide-react | ^0.511.0 | アイコンライブラリ |

## 依存方向ルール（AGENTS.md Section 3準拠）

```
components/ → hooks/ / utils/ / services/ → data/
```

- この一方向を厳守し、循環参照を作らない

## 状態管理パターン

1. **導出値の原則**: 他のstateから導出できる値は `useState` に保存せず、`useMemo` で導出する
2. **カスタムフック**: ビジネスロジックは `src/hooks/` に集約する
3. **サービス層**: データI/Oは `src/services/` に集約する



## サブエージェント受託時の必須確認

- ブリーフィングに絶対原則が含まれていない場合は、実装開始前にAGENTS.mdを自律的に読み込むこと
- 変更完了後は必ず npm run build を実行し、結果を報告すること

## ディレクトリ構成

```
src/
├── components/    # UIコンポーネント（.jsx）
├── hooks/         # カスタムフック
├── services/      # データI/O・API呼び出し
├── utils/         # 純粋なユーティリティ関数
├── data/          # 定数・設定値
├── App.jsx        # ルートコンポーネント
├── main.jsx       # エントリポイント
└── index.css      # グローバルCSS（Tailwindインポート）
```

## Vite ローカルAPIミドルウェア

`vite.config.js` に以下のローカルAPIが組み込まれている：

| エンドポイント | 用途 |
|---|---|
| `POST /api/save-master` | マスタデータ保存 → `public/data/master.json` |
| `POST /api/save-daily` | 日次スケジュール保存 → `public/data/daily/{date}.json` |
| `POST /api/save-exceptions` | 例外データ保存 → `public/data/exceptions.json` |
| `POST /api/save-templates` | テンプレート保存 → `public/data/templates.json` |

**注意**: `public/data/**/*.json` はViteのファイルウォッチャーから除外されている（自動リロード防止）。

## よく使うコマンド

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルド結果プレビュー |

## 実装上の注意点 (Pitfalls)

### Vite環境でのローカルJSONフェッチ時のエラーハンドリング
Vite開発サーバーはSPAフォールバックとして、存在しないファイルへのリクエストに対して `index.html` を `200 OK` で返却します。
そのため、ローカルのJSONファイルを `fetch` する際、単に `response.ok` を確認するだけでは、欠損時にHTMLを `response.json()` でパースしようとして `SyntaxError` (Unexpected token '<') が発生します。

**【ルール】**
ローカルのJSONを `fetch` する場合は、必ず `Content-Type` が `application/json` であることを確認してからパースすること。

```javascript
// ❌ 悪い例 (ファイルが存在しないと SyntaxError になる)
const response = await fetch('/data/local.json');
if (response.ok) {
  const data = await response.json();
}

// ✅ 良い例 (Content-Typeを確認する)
const response = await fetch('/data/local.json');
if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
  const data = await response.json();
}
```
