import { ToastProvider } from './components/Toast';
import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import Login from './components/Login'
import { ErrorBoundary } from './components/ErrorBoundary'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'

function AuthWrapper() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      // 開発環境かつ未ログインの場合、自動ログインを試行
      if (!session && import.meta.env.DEV && import.meta.env.VITE_AUTO_LOGIN_EMAIL && import.meta.env.VITE_AUTO_LOGIN_PASSWORD) {
        supabase.auth.signInWithPassword({
          email: import.meta.env.VITE_AUTO_LOGIN_EMAIL,
          password: import.meta.env.VITE_AUTO_LOGIN_PASSWORD,
        }).then(({ error }) => {
          if (error) console.error("Auto login failed:", error);
        }).finally(() => {
          setInitialized(true);
        });
        return;
      }

      setInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">読み込み中...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AuthWrapper />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
