---
description: AMP (資産変更申請) の承認記録を AMPLOG.md に自動追加する
---
// turbo-all
1. **AMP情報の収集**: ユーザーに Title, Scope, Impact を確認。
2. **記録**: `node .agent/scripts/record_amp.js ...` (※現状スクリプト未実装のため手動記録を促すか、将来的に自動化)
3. **Seal検証**: `node .agent/scripts/check_seal.js`
