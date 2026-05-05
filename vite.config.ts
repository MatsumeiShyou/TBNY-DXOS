import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// [ARCHITECTURE NOTE] RePaper Route のアクセス方法について
// -------------------------------------------------------
// RePaper Route は独立したサーバー(localhost:5174)では動かない。
// 正規アクセスフロー：
//   localhost:5173 (TBNY DXOS ポータル) → 「配車パネル」タイルをクリック
//   → appComponents.tsx の repaper-route-admin が RePaperRouteApp を lazy レンダリング
//
// /repaper-route への直接URLアクセスは非サポート。
// プロキシを再追加しないこと（localhost:5174 は存在しない）。
//
export default defineConfig({
  plugins: [react()],
})
