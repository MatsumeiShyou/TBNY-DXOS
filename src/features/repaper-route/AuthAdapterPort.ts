import { useAuth as useDXAuth } from '../hooks/useAuth';


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
    isLoading,
    // 移植元が期待する追加メソッドがあればここで定義
    isAuthenticated: !!currentUser,
  };
};
