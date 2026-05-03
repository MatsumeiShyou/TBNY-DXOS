import { useState, lazy, Suspense } from 'react';
import { AuthProvider } from '../features/contexts/AuthContext';
import { useAuth } from '../features/hooks/useAuth';
import { NotificationProvider } from '../features/contexts/NotificationContext';
import { SplashScreen } from '../shared/components/SplashScreen';
import { LoginGate } from '../features/components/LoginGate';
import { APP_COMPONENTS } from '../features/config/appComponents';
import { APPS_REGISTRY } from '../features/config/appsRegistry';

// 重いコンポーネントを遅延読み込み（ログイン画面のバンドルから除外）
const DXOSPortal = lazy(() => import('./DXOSPortal').then(m => ({ default: m.DXOSPortal })));
const DXGlobalNavigation = lazy(() => import('../features/components/DXGlobalNavigation').then(m => ({ default: m.DXGlobalNavigation })));
import '../shared/styles/design-tokens.css';

/**
 * AppContent — 認証後のメインコンテンツ
 *
 * ポータル（ランチャー）をデフォルト表示し、
 * アプリ選択に応じてビューを動的に切り替える。
 */
function AppContent() {
  const { currentUser, authStatus, isLoading } = useAuth();
  const [activeApp, setActiveApp] = useState<string | null>(null);

  if (isLoading) {
    return <SplashScreen />;
  }

  // ログイン済み（確定）または暫定ログイン（楽観的）の場合、ポータルを表示
  const isUserAuthenticated = authStatus === 'VERIFIED' || authStatus === 'OPTIMISTIC';

  if (!isUserAuthenticated && !currentUser) {
    return <LoginGate />;
  }

  // ポータルまたはアプリの表示（認証済み）
  return (
    <Suspense fallback={<SplashScreen />}>
      {activeApp ? (
        <div>
          <DXGlobalNavigation
            currentAppLabel={APPS_REGISTRY[activeApp]?.label || activeApp}
            onBackToPortal={() => setActiveApp(null)}
          />
          <div className="app-viewport">
            {activeApp && APP_COMPONENTS[activeApp] ? (
              (() => {
                const ActiveAppComponent = APP_COMPONENTS[activeApp];
                return <ActiveAppComponent />;
              })()
            ) : null}
          </div>
        </div>
      ) : (
        <DXOSPortal onAppSelect={setActiveApp} />
      )}
    </Suspense>
  );
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
