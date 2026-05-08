import { useState } from 'react';
import { useAuth } from './AuthAdapterPort';
import { AdminLayout } from './components/AdminLayout';
import BoardCanvas from './board/BoardCanvas';

import { MASTER_SCHEMAS } from './config/masterSchema';
import { MasterDataLayout } from './components/MasterDataLayout';
import { AuditLogView } from './components/AuditLogView';
import { DeviceSettings } from './settings/DeviceSettings';
import { DashboardView } from './components/DashboardView';
import { MasterDataProvider } from './MasterDataAdapterPort';

/**
 * RePaper Route 統合アプリケーション
 */
export const RePaperRouteApp = () => {
  const { currentUser, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('board');

  if (isLoading || !currentUser) {
    return <div className="tw-p-8 tw-text-slate-400">Loading Module Profile...</div>;
  }

  const renderView = () => {
    // マスタ管理画面の動的ルーティング
    if (activeView.startsWith('master_')) {
      const schemaKey = activeView.replace('master_', '');
      const schema = MASTER_SCHEMAS[schemaKey];
      if (schema) {
        return <MasterDataLayout schema={schema} />;
      }
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'board':
        return <BoardCanvas />;
      case 'sdr':
        return <AuditLogView />;
      case 'users':
        return <MasterDataLayout schema={MASTER_SCHEMAS.staffs} />;
      case 'settings':
        return <DeviceSettings />;
      default:
        return (
          <div className="tw-p-20 tw-text-center tw-text-slate-500">
            <h2 className="tw-text-xl tw-font-bold">Coming Soon</h2>
            <p>この画面（{activeView}）は現在統合準備中です。</p>
          </div>
        );
    }
  };

  return (
    <MasterDataProvider>
      <AdminLayout activeView={activeView} onViewChange={setActiveView}>
        {renderView()}
      </AdminLayout>
    </MasterDataProvider>
  );
};
