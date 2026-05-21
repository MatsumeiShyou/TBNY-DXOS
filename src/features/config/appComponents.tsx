/* eslint-disable react-refresh/only-export-components */
import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';

// 各業務アプリの lazy インポート定義
const RePaperRouteAppLazy = lazy(() => import('../repaper-route/RePaperRouteApp').then(m => ({ default: m.RePaperRouteApp })));
const MasterDataManagerLazy = lazy(() => import('../components/MasterDataManager').then(m => ({ default: m.MasterDataManager })));
const DriverOSAppLazy = lazy(() => import('../repaper-route/driver/DriverOSApp').then(m => ({ default: m.default })));
const WeighingSelfDriverAppLazy = lazy(() => import('../weighing-self-driver/WeighingSelfDriverApp').then(m => ({ default: m.default })));
const WeighingSelfAdminAppLazy = lazy(() => import('../weighing-self-admin/WeighingSelfAdminApp').then(m => ({ default: m.default })));

/**
 * LazyWrapper - ホワイトアウト防止用の Suspense + ErrorBoundary 境界
 */
const LazyWrapper = ({ children, name }: { children: React.ReactNode, name: string }) => (
  <ErrorBoundary name={name}>
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        background: '#0b0d14',
        color: '#3b82f6'
      }}>
        <div className="animate-pulse font-black text-xs tracking-widest">LOADING {name.toUpperCase()}...</div>
      </div>
    }>
      {children}
    </Suspense>
  </ErrorBoundary>
);

/**
 * appRegistry — app_id に基づいてコンポーネントを返す定数マップ
 */
export const APP_COMPONENTS: Record<string, React.ReactNode> = {
  'master-data': (
    <LazyWrapper name="マスタ管理">
      <MasterDataManagerLazy />
    </LazyWrapper>
  ),
  'repaper-route-admin': (
    <LazyWrapper name="配車パネル">
      <RePaperRouteAppLazy />
    </LazyWrapper>
  ),
  'repaper-route-driver': (
    <LazyWrapper name="ドライバーOS">
      <DriverOSAppLazy />
    </LazyWrapper>
  ),

  'weighing-self-driver': (
    <LazyWrapper name="セルフ計量記録">
      <WeighingSelfDriverAppLazy />
    </LazyWrapper>
  ),
  'weighing-admin': (
    <LazyWrapper name="計量管理ダッシュボード">
      <WeighingSelfAdminAppLazy />
    </LazyWrapper>
  ),
};
