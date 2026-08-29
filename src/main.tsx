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
