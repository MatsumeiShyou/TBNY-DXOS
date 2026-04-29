import { useState } from 'react';
import { AuthProvider } from '../features/contexts/AuthContext';
import { useAuth } from '../features/hooks/useAuth';
import { NotificationProvider } from '../features/contexts/NotificationContext';
import { DXOSPortal } from './DXOSPortal';
import { DXGlobalNavigation } from '../features/components/DXGlobalNavigation';
import { LoginGate } from '../features/components/LoginGate';
import { APP_COMPONENTS } from '../features/config/appComponents';
import { APPS_REGISTRY } from '../features/config/appsRegistry';
import '../shared/styles/design-tokens.css';

/**
 * AppContent — 認証後のメインコンテンツ
 *
 * ポータル（ランチャー）をデフォルト表示し、
 * アプリ選択に応じてビューを動的に切り替える。
 */
function AppContent() {
  const { currentUser } = useAuth();
  const [activeApp, setActiveApp] = useState<string | null>(null);

  // 未認証：ログイン画面
  if (!currentUser) {
    return <LoginGate />;
  }

  // アプリ選択済み：選択されたモジュールを表示
  if (activeApp) {
    const appConfig = APPS_REGISTRY[activeApp];
    const appLabel = appConfig?.label || activeApp;

    return (
      <div>
        <DXGlobalNavigation
          currentAppLabel={appLabel}
          onBackToPortal={() => setActiveApp(null)}
        />
        <div className="app-viewport">
          {APP_COMPONENTS[activeApp] || null}
        </div>
      </div>
    );
  }

  // デフォルト：DXOSポータル（ランチャー）
  return <DXOSPortal onAppSelect={setActiveApp} />;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
