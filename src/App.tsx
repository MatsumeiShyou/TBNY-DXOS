import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DXOSPortal } from './components/DXOSPortal';
import { DXGlobalNavigation } from './components/DXGlobalNavigation';
import { MasterDataLayout } from './components/MasterDataLayout';
import { masterSchema } from './config/masterSchema';
import { APPS_REGISTRY } from './config/appsRegistry';
import { supabase } from './lib/supabase/client';
import './styles/design-tokens.css';

/**
 * LoginGate — 未認証ユーザーにサインイン画面を表示
 *
 * メール/パスワード認証を主軸とし、Google OAuthは補助手段として提供。
 * これによりGoogle障害時でも業務OSへのアクセスを維持する。
 */
function LoginGate() {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) return null;

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    setIsSubmitting(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsSubmitting(false);

    if (authError) {
      setError('認証に失敗しました。メールアドレスまたはパスワードを確認してください。');
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="dxos-portal" style={{ justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #e2e8f0 30%, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
          }}>
            TBNY DXOS
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            坪野谷紙業 厚木事業所 業務基盤OS
          </p>
        </div>

        {/* メール/パスワード ログインフォーム */}
        <form onSubmit={handleEmailLogin} style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          padding: '2rem 1.75rem',
          backdropFilter: 'blur(12px)',
        }}>
          <h2 style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: '#cbd5e1',
            margin: '0 0 1.5rem',
            textAlign: 'center',
          }}>
            サインイン
          </h2>

          {/* エラーメッセージ */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '0.625rem 0.875rem',
              marginBottom: '1.25rem',
              fontSize: '0.8125rem',
              color: '#f87171',
            }}>
              {error}
            </div>
          )}

          {/* メールアドレス */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#94a3b8',
              marginBottom: '0.375rem',
            }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            />
          </div>

          {/* パスワード */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#94a3b8',
              marginBottom: '0.375rem',
            }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            />
          </div>

          {/* サインインボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 24px rgba(99, 102, 241, 0.3)',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {isSubmitting ? '認証中...' : 'サインイン'}
          </button>

          {/* 区切り線 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: '1.5rem 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '0.6875rem', color: '#475569' }}>または</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Google OAuth（補助） */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            style={{
              width: '100%',
              padding: '0.625rem',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            Googleアカウントでサインイン
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * AppContent — 認証後のメインコンテンツ
 *
 * ポータル（ランチャー）をデフォルト表示し、
 * アプリ選択に応じてビューを動的に切り替える。
 */
function AppContent() {
  const { currentUser } = useAuth();
  const [activeApp, setActiveApp] = useState(null);

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
        {renderApp(activeApp)}
      </div>
    );
  }

  // デフォルト：DXOSポータル（ランチャー）
  return <DXOSPortal onAppSelect={setActiveApp} />;
}

/**
 * renderApp — app_id に基づいてコンポーネントを返す
 *
 * 新しいモジュールが増えた場合はここに case を追加する。
 */
function renderApp(appId) {
  switch (appId) {
    case 'master-data':
      return (
        <div className="app-container">
          <MasterDataLayout schema={masterSchema} />
        </div>
      );

    case 'repaper-route-admin':
    case 'repaper-route-driver':
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 41px)',
          background: '#0b0d14',
          color: '#64748b',
          fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
          textAlign: 'center',
          padding: '2rem',
        }}>
          <div>
            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
              {APPS_REGISTRY[appId]?.label}
            </p>
            <p style={{ fontSize: '0.8125rem' }}>
              このモジュールは外部アプリケーション（RePaper Route）として稼働中です。<br />
              統合リンクは今後のフェーズで実装予定です。
            </p>
          </div>
        </div>
      );

    case 'weighing-self-driver':
    case 'weighing-admin':
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 41px)',
          background: '#0b0d14',
          color: '#64748b',
          fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
          textAlign: 'center',
          padding: '2rem',
        }}>
          <div>
            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
              {APPS_REGISTRY[appId]?.label}
            </p>
            <p style={{ fontSize: '0.8125rem' }}>
              このモジュールは統合準備中です。
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
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
