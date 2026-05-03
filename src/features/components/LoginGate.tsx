import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthAdapter } from '../../shared/lib/auth/AuthAdapter';

export function LoginGate() {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // [SAFETY] 認証リクエストが10秒以上かかる場合は強制的にタイムアウトさせる
      const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 10000)
      );

      const loginTask = AuthAdapter.signInWithPassword(email, password);
      const result = await Promise.race([loginTask, timeout]);
      
      const { error: authError } = result as { error: any };
      if (authError) {
        console.error('[AUTH] Login failed:', authError.message);
        setError('認証に失敗しました。メールアドレスまたはパスワードを確認してください。');
      }
    } catch (err: any) {
      console.error('[AUTH] Login exception:', err);
      if (err.message === 'AUTH_TIMEOUT') {
        setError('認証リクエストがタイムアウトしました。通信環境を確認し、もう一度お試しください。');
      } else {
        setError('認証中に予期せぬエラーが発生しました。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      fontFamily: 'Inter, sans-serif',
      color: '#f8fafc'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', borderRadius: '1rem', marginBottom: '1rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>TBNY DXOS</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem', letterSpacing: '0.1em' }}>PRECISION OPERATING SYSTEM</p>
        </div>

        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}
          <input 
            type="email" 
            placeholder="メールアドレス" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
          />
          <input 
            type="password" 
            placeholder="パスワード" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              background: '#3b82f6', 
              color: 'white', 
              fontWeight: 600, 
              border: 'none', 
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            {isSubmitting ? '認証中...' : 'サインイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
