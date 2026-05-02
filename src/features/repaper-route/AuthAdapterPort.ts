import { useAuth as useDXAuth } from '../hooks/useAuth';
import { AuthAdapter } from '../../shared/lib/auth/AuthAdapter';

/**
 * RePaper Route 向け Auth Adapter
 * 
 * 移植されたモジュールが期待する useAuth インターフェースを提供し、
 * ポータル本体の AuthContext へブリッジする。
 */
export const useAuth = () => {
  const { currentUser, isLoading } = useDXAuth();
  
  return {
    currentUser,
    staff: currentUser,
    isLoading,
    status: isLoading ? 'INITIALIZING' : (currentUser ? 'AUTHENTICATED' : 'UNAUTHENTICATED'),
    permissions: currentUser?.permissions,
    logout: () => AuthAdapter.signOut(),
    isAuthenticated: !!currentUser,
  };

};
