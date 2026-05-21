/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { WeighingAuthProvider, useWeighingAuth } from './contexts/WeighingAuthContext';
import { MasterDataProvider } from './contexts/MasterDataContext';
import { WeighingSessionProvider, useWeighingSession } from './contexts/WeighingSessionContext';
import { OfflineQueueProvider } from './contexts/OfflineQueueContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import LoginScreen from './components/auth/LoginScreen';
import WeighingFlow from './components/weighing/WeighingFlow';
import HistoryScreen from './components/history/HistoryScreen';
import SettingsScreen from './components/settings/SettingsScreen';
import AppInitializer from './components/common/AppInitializer';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import useOnlineStatus from './hooks/useOnlineStatus';
import Toast from './components/ui/Toast';
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';
import { Sparkles, Plus } from 'lucide-react';

export type AppView = 'weighing' | 'history' | 'settings';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <WeighingAuthProvider>
        <AppWithProviders />
      </WeighingAuthProvider>
    </ToastProvider>
  );
};

const AppWithProviders: React.FC = () => {
    const { userSettings } = useWeighingAuth();

    return (
        <SettingsProvider initialSettings={userSettings}>
            <MasterDataProvider>
                <WeighingSessionProvider>
                    <OfflineQueueProvider>
                        <HistoryProvider>
                            <AppContent />
                        </HistoryProvider>
                    </OfflineQueueProvider>
                </WeighingSessionProvider>
            </MasterDataProvider>
        </SettingsProvider>
    );
};


const AppContent: React.FC = () => {
  const { isAuthenticated, isFirstLogin } = useWeighingAuth();
  const { toasts } = useToast();
  useSettings(); // Initialize settings listeners
  const isOnline = useOnlineStatus();
  const [currentView, setCurrentView] = useState<AppView>('weighing');
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false);
  const { resetSession, grossWeight, items } = useWeighingSession();

  const isSessionInProgress = grossWeight !== null || items.length > 0;

  useEffect(() => {
    if (isAuthenticated && isFirstLogin) {
      setIsWelcomeModalOpen(true);
    }
  }, [isAuthenticated, isFirstLogin]);

  const handleResetAndHome = () => {
    setCurrentView('weighing');
    resetSession();
    setIsNewRecordModalOpen(false);
  };

  const handleNewRecordClick = () => {
    if (isSessionInProgress) {
      setIsNewRecordModalOpen(true);
    } else {
      handleResetAndHome();
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'weighing':
        return <WeighingFlow />;
      case 'history':
        return <HistoryScreen onDetailViewChange={setIsHistoryDetailOpen} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <WeighingFlow />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {!isOnline && (
        <div className="bg-yellow-500 dark:bg-yellow-600 text-white dark:text-slate-900 text-center p-2 font-bold">
          オフラインです
        </div>
      )}
      
      <AppInitializer>
        {isAuthenticated ? (
          <>
            <Header currentView={currentView} />
            <main className={`flex-grow ${!isHistoryDetailOpen ? 'pb-24' : ''}`}>
              {renderCurrentView()}
            </main>
            {!isHistoryDetailOpen && (
              <>
                <div className="fixed bottom-24 right-6 z-30">
                    <button
                        onClick={handleNewRecordClick}
                        className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 transition-transform transform hover:scale-110"
                        aria-label="新規作成"
                        title="新規作成"
                    >
                        <Plus size={28} />
                    </button>
                </div>
                <Footer 
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                />
              </>
            )}
            <Modal
              isOpen={isNewRecordModalOpen}
              onClose={() => setIsNewRecordModalOpen(false)}
              title="新しい記録を開始しますか？"
            >
              <p className="text-slate-600 dark:text-slate-300 mb-6">現在の入力内容は破棄されます。よろしいですか？</p>
              <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setIsNewRecordModalOpen(false)}>入力に戻る</Button>
                  <Button variant="danger" onClick={handleResetAndHome}>はい、破棄します</Button>
              </div>
            </Modal>
            <Modal
              isOpen={isWelcomeModalOpen}
              onClose={() => setIsWelcomeModalOpen(false)}
              title="ようこそ！"
            >
              <div className="text-center">
                <Sparkles className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <h4 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-2">セルフ計量記録アプリへ</h4>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  このアプリは、計量記録を簡単に行うためのツールです。<br/>
                  画面下のメニューから操作してください。
                </p>
                <ul className="text-left space-y-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mb-6">
                  <li><strong className="text-blue-600 dark:text-blue-400">計量記録:</strong> ステップに従って新しい記録を作成します。</li>
                  <li><strong className="text-blue-600 dark:text-blue-400">履歴:</strong> 過去の記録を確認・編集できます。</li>
                  <li><strong className="text-blue-600 dark:text-blue-400">設定:</strong> 表示テーマや文字サイズを調整できます。</li>
                  <li><strong className="text-blue-600 dark:text-blue-400">新規作成:</strong> 画面右下の「+」ボタンで新しい記録を開始します。</li>
                </ul>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">オフラインでも利用可能です。</p>
                <Button onClick={() => setIsWelcomeModalOpen(false)} fullWidth>はじめる</Button>
              </div>
            </Modal>
          </>
        ) : (
          <LoginScreen />
        )}
      </AppInitializer>
      
      <div className="fixed bottom-20 right-4 space-y-2 z-40">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};

export default App;