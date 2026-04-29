import { MasterDataLayout } from '../components/MasterDataLayout';
import { masterSchema } from './masterSchema';
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
    <div className="app-container">
      <MasterDataLayout schema={masterSchema} />
    </div>
  ),
  'repaper-route-admin': (
    <div style={placeholderStyle('repaper-route-admin')}>
      <div>
        <p style={labelStyle}>{APPS_REGISTRY['repaper-route-admin']?.label}</p>
        <p style={subTextStyle}>
          このモジュールは外部アプリケーション（RePaper Route）として稼働中です。<br />
          統合リンクは今後のフェーズで実装予定です。
        </p>
      </div>
    </div>
  ),
  'repaper-route-driver': (
    <div style={placeholderStyle('repaper-route-driver')}>
      <div>
        <p style={labelStyle}>{APPS_REGISTRY['repaper-route-driver']?.label}</p>
        <p style={subTextStyle}>
          このモジュールは外部アプリケーション（RePaper Route）として稼働中です。<br />
          統合リンクは今後のフェーズで実装予定です。
        </p>
      </div>
    </div>
  ),
  'weighing-self-driver': (
    <div style={placeholderStyle('weighing-self-driver')}>
      <div>
        <p style={labelStyle}>{APPS_REGISTRY['weighing-self-driver']?.label}</p>
        <p style={subTextStyle}>このモジュールは統合準備中です。</p>
      </div>
    </div>
  ),
  'weighing-admin': (
    <div style={placeholderStyle('weighing-admin')}>
      <div>
        <p style={labelStyle}>{APPS_REGISTRY['weighing-admin']?.label}</p>
        <p style={subTextStyle}>このモジュールは統合準備中です。</p>
      </div>
    </div>
  ),
};
