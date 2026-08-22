# 現在のコンテキスト (ID維持バグ修正)

## 要件
配車盤で未配車リストからジョブをドラッグして割り当てた際、カレンダー側で保持している固有ID（spot_... 等）が上書きされ、同期が切れてしまうバグを修正する。

## 影響する変数とファイルパス
- `c:/Users/shiyo/開発中APP/回収アプリ/src/App.jsx`
  - `handleAddJobDirect` メソッド内の `newJob` 生成時、`id: jobTemplate.id || 'new_' + Date.now()` と元のIDを維持するように修正する。
