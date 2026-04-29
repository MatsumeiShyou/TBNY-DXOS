import { MasterDataLayout } from '../components/MasterDataLayout';
import { masterSchemas } from './masterSchema';
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

import { Database, Users, CreditCard, ShoppingCart, MapPin } from 'lucide-react';

/**
 * MasterDataManager — 複数のマスタスキーマを切り替えるラッパー
 */
function MasterDataManager() {
  const [currentKey, setCurrentKey] = React.useState('staffs');
  
  const getIcon = (key: string) => {
    switch(key) {
      case 'staffs': return <Users size={18} />;
      case 'payers': return <CreditCard size={18} />;
      case 'suppliers': return <ShoppingCart size={18} />;
      case 'locations': return <MapPin size={18} />;
      default: return <Database size={18} />;
    }
  };
  
  return (
    <div className="master-manager">
      <nav className="master-tabs">
        {Object.entries(masterSchemas).map(([key, schema]) => (
          <button 
            key={key}
            className={`master-tab-btn ${currentKey === key ? 'active' : ''}`}
            onClick={() => setCurrentKey(key)}
          >
            {getIcon(key)}
            {schema.title}
          </button>
        ))}
      </nav>
      <div className="master-view-content">
        <MasterDataLayout key={currentKey} schema={masterSchemas[currentKey]} />
      </div>
    </div>
  );
}


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
