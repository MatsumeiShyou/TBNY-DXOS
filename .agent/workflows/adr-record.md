---
description: 決定事項の確実な記録 (ADR/AMPLOG Recording Enforcement)
---
1. **Reasoning Generation**: システムが自動生成できない「なぜそのアーキテクチャやルールを採用したか（背景、代替案、決定理由）」をAIとして明文化せよ。
2. **Command Execution**: 準備した内容を用いて、`node .agent/scripts/record_amp.js` などの適切な記録コマンドを実行せよ。
3. **Bypass Rule**: 単なる誤字修正やスペース調整などの些細な変更（ルールの意味が変わらないもの）の場合は、ADRを作成せず、コミットメッセージに `[minor]` または `[typo]` を含めて `commit-msg` フックをバイパスせよ。
