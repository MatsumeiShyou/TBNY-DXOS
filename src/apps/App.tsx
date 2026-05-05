import { useState, lazy, Suspense } from 'react';
import { AuthProvider } from '../features/contexts/AuthContext';
import { useAuth } from '../features/hooks/useAuth';
import { NotificationProvider } from '../features/contexts/NotificationContext';
import { SplashScreen } from '../shared/components/SplashScreen';
import { LoginGate } from '../features/components/LoginGate';
import { APP_COMPONENTS } from '../features/config/appComponents';
import { APPS_REGISTRY } from '../features/config/appsRegistry';
import '../shared/styles/design-tokens.css';

// 重いコンポーネントを lazy インポートで分離し、ログイン画面の表示を最速化する
const DXOSPortal = lazy(() => import('./DXOSPortal').then(m => ({ default: m.DXOSPortal })));
const DXGlobalNavigation = lazy(() => import('../features/components/DXGlobalNavigation').then(m => ({ default: m.DXGlobalNavigation })));

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

  // [DEFENSIVE] プロファイルが未ロードかつ認証確定前ならスプラッシュ表示を維持
  if (isUserAuthenticated && !currentUser && authStatus !== 'OPTIMISTIC') {
    return <SplashScreen />;
  }

  if (!isUserAuthenticated && !currentUser) {
    return <LoginGate />;
  }

  // アプリ選択済み：選択されたモジュールを表示
  if (activeApp) {
    const appConfig = APPS_REGISTRY[activeApp];
    const appLabel = appConfig?.label || activeApp;

    return (
      <Suspense fallback={<SplashScreen />}>
        <div>
          <DXGlobalNavigation
            currentAppLabel={appLabel}
            onBackToPortal={() => setActiveApp(null)}
          />
          <div className="app-viewport">
            {APP_COMPONENTS[activeApp] || null}
          </div>
        </div>
      </Suspense>
    );
  }

  // デフォルト：DXOSポータル（ランチャー）
  return (
    <Suspense fallback={<SplashScreen />}>
      <DXOSPortal onAppSelect={setActiveApp} />
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Suspense fallback={<SplashScreen />}>
          <AppContent />
        </Suspense>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
