import { APPS_REGISTRY } from './appsRegistry';
import React, { lazy, Suspense } from 'react';
// 各業務アプリの lazy インポート定義
const RePaperRouteAppLazy = lazy(() => import('../repaper-route/RePaperRouteApp').then(m => ({ default: m.RePaperRouteApp })));
const MasterDataManagerLazy = lazy(() => import('../components/MasterDataManager').then(m => ({ default: m.MasterDataManager })));

/**
 * LazyWrapper - ホワイトアウト防止用の Suspense 境界
 */
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100%', 
      background: '#0b0d14',
      color: '#3b82f6'
    }}>
      <div className="animate-pulse font-black text-xs tracking-widest">LOADING MODULE...</div>
    </div>
  }>
    {children}
  </Suspense>
);

const labelStyle: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: '0.5rem',
};

const subTextStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
};

const previewImageStyle: React.CSSProperties = {
  marginTop: '2rem',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  opacity: 0.8,
};

function placeholderStyle(_appId: string): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 41px)',
    background: '#0b0d14',
    color: '#64748b',
    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
    textAlign: 'center',
    padding: '2rem',
  };
}

/**
 * appRegistry — app_id に基づいてコンポーネントを返す定数マップ
 */
export const APP_COMPONENTS: Record<string, React.ReactNode> = {
  'master-data': (
    <LazyWrapper>
      <MasterDataManagerLazy />
    </LazyWrapper>
  ),
  'repaper-route-admin': (
    <LazyWrapper>
      <RePaperRouteAppLazy />
    </LazyWrapper>
  ),
  'repaper-route-driver': (
    <LazyWrapper>
      <DriverOSAppLazy />
    </LazyWrapper>
  ),

  'weighing-self-driver': (
    <div style={placeholderStyle('weighing-self-driver')}>
      <div>
        <p style={labelStyle}>{APPS_REGISTRY['weighing-self-driver']?.label}</p>
        <p style={subTextStyle}>計量OSの中枢モジュール。統合プロトタイプを先行公開。</p>
      </div>
      {/* gov-bypass [II-2] */}
      <img src="/weighing-preview.png" style={previewImageStyle} alt="Preview" />
    </div>
  ),
  'weighing-admin': (
    <div style={placeholderStyle('weighing-admin')}>
      <div>
        <p style={labelStyle}>{APPS_REGISTRY['weighing-admin']?.label}</p>
        <p style={subTextStyle}>管理者向け計量分析。データ集計基盤の構築中。</p>
      </div>
      {/* gov-bypass [II-2] */}
      <img src="/weighing-preview.png" style={previewImageStyle} alt="Preview" />
    </div>
  ),
};
