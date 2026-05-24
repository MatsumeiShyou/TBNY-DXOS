# Knowledge Item: Cloudflare Pages 削除不能デッドロックの救済手順

## 概要
Cloudflare Pages プロジェクトのデプロイ履歴が 100 件を超えると、UI からのプロジェクト削除が失敗する。この事象は Cloudflare の API 制限に起因するものであり、CLI または API による履歴の物理的削除（パージ）を経てからプロジェクトを削除する必要がある。

## 物理的証跡と解決策
1. **原因**: 履歴の過剰蓄積による API タイムアウト。
2. **解決ルート**:
   - **Wrangler CLI**: `wrangler pages deployment delete` をループ実行。
   - **公式 Node.js スクリプト**: `delete-all-deployments` スクリプトの実行。
   - **ブラウザ JS**: コンソールから `fetch` を使用して削除。
3. **必須パラメーター**:
   - API トークン（Pages 編集権限）
   - アカウント ID
   - プロジェクト名

## 実戦 PowerShell スクリプト
```powershell
$projectName = "target-project-name"
$deployments = npx wrangler pages deployment list --project-name $projectName --json | ConvertFrom-Json
foreach ($d in $deployments) {
    npx wrangler pages deployment delete $d.Id --project-name $projectName --force
}
npx wrangler pages project delete $projectName
```

## 注意点
削除後は環境変数（特に Supabase 関連）や Node.js バージョンの再設定を忘れないこと。
