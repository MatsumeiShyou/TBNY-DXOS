import React from 'react';
import { useAuth } from '../../features/hooks/useAuth';

interface VerificationGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * VerificationGate
 * 
 * 認証が 'VERIFIED' になるまでコンテンツの描画とデータフェッチを保留し、
 * スケルトンやプレースホルダーを表示するガードコンポーネント。
 */
export const VerificationGate: React.FC<VerificationGateProps> = ({ 
  children, 
  fallback 
}) => {
  const { authStatus } = useAuth();

  // 認証が確定（VERIFIED）していない場合は、フォールバックを表示
  if (authStatus !== 'VERIFIED') {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
};

/**
 * SkeletonTile
 * タイルのロード中表示用。
 */
export const SkeletonTile: React.FC = () => (
  <div className="dxos-tile skeleton" style={{ 
    background: 'rgba(255,255,255,0.05)', 
    border: '1px dashed rgba(255,255,255,0.1)',
    pointerEvents: 'none'
  }}>
    <div className="dxos-tile__icon-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
    <div style={{ height: 16, width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginTop: 12 }}></div>
    <div style={{ height: 10, width: '80%', background: 'rgba(255,255,255,0.02)', borderRadius: 4, marginTop: 8 }}></div>
  </div>
);
