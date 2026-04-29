import { APPS_REGISTRY } from './appsRegistry';
import React from 'react';

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

import { MasterDataManager } from '../components/MasterDataManager';

/**
 * appRegistry — app_id に基づいてコンポーネントを返す定数マップ
 */
export const APP_COMPONENTS: Record<string, React.ReactNode> = {
  'master-data': (
    <div className="app-container">
      <MasterDataManager />
    </div>
  ),
  'repaper-route-admin': (
    <div style={placeholderStyle('repaper-route-admin')}>
      <div>
        <p style={labelStyle}>{APPS_REGISTRY['repaper-route-admin']?.label}</p>
        <p style={subTextStyle}>
          このモジュールは外部アプリケーションとして稼働中です。統合後のイメージを表示しています。
        </p>
      </div>
      {/* gov-bypass [II-2] Use native img for high-res mockup preview in Vite environment */}
      <img src="/repaper-preview.png" style={previewImageStyle} alt="Preview" />
    </div>
  ),
  'repaper-route-driver': (
    <div style={placeholderStyle('repaper-route-driver')}>
      <div>
        <p style={labelStyle}>{APPS_REGISTRY['repaper-route-driver']?.label}</p>
        <p style={subTextStyle}>
          ドライバー専用ビュー。統合開発進行中。
        </p>
      </div>
      {/* gov-bypass [II-2] */}
      <img src="/repaper-preview.png" style={previewImageStyle} alt="Preview" />
    </div>
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
