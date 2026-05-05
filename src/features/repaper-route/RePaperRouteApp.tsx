import { useState } from 'react';
import { useAuth } from './AuthAdapterPort';
import { AdminLayout } from './components/AdminLayout';
import BoardCanvas from './board/BoardCanvas';

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
    switch (activeView) {
      case 'board':
        return <BoardCanvas />;
      default:
        return (
          <div className="tw-p-20 tw-text-center tw-text-slate-500">
            <h2 className="tw-text-xl tw-font-bold">Coming Soon</h2>
            <p>この画面は現在統合準備中です。</p>
          </div>
        );
    }
  };

  return (
    <AdminLayout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </AdminLayout>
  );
};
