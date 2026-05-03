import { useMemo, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Truck,
  Database,
  Scale,
  BarChart3,
  ShieldAlert,
  LogOut,
  Hexagon,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../features/hooks/useAuth';
import { AuthAdapter } from '../shared/lib/auth/AuthAdapter';
import { APPS_REGISTRY, type AppConfig } from '../features/config/appsRegistry';
import { SkeletonTile } from '../shared/components/VerificationGate';
import '../shared/styles/portal.css';

/**
 * アイコン名と Lucide コンポーネントの対応マップ。
 * appsRegistry.ts で定義された icon 文字列をコンポーネントに解決する。
 */
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Truck,
  Database,
  Scale,
  BarChart3,
};

interface AuthorizedTile extends AppConfig {
  id: string;
}

interface DXOSPortalProps {
  onAppSelect: (appId: string) => void;
}

/**
 * DXOSPortal — 基盤業務OSのランチャー画面
 *
 * staffs.allowed_apps に基づき、利用可能なアプリをタイルとして表示する。
 * 認証済みユーザーのみが到達する。
 */
export const DXOSPortal = ({ onAppSelect }: DXOSPortalProps) => {
  const { currentUser, isLoading, authStatus } = useAuth();

  // allowed_apps に基づいて表示タイルを生成（order順にソート）
  const authorizedTiles: AuthorizedTile[] = useMemo(() => {
    if (!currentUser?.allowed_apps) return [];

    return currentUser.allowed_apps
      .filter((appId: string) => {
        const config = APPS_REGISTRY[appId];
        return config && config.isEnabled !== false;
      })
      .map((appId: string) => ({
        id: appId,
        ...APPS_REGISTRY[appId],
      }))
      .sort((a: AuthorizedTile, b: AuthorizedTile) => a.order - b.order);
  }, [currentUser]);

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [pendingAppId, setPendingAppId] = useState<string | null>(null);

  // 認証が確定した際に、保留中のアプリがあれば起動する
  useEffect(() => {
    if (authStatus === 'VERIFIED' && pendingAppId) {
      console.log(`[DECISION] DXOSPortal: Verification complete. Launching pending app: ${pendingAppId}`);
      const appId = pendingAppId;
      setPendingAppId(null);
      handleTileClick(appId);
    }
  }, [authStatus, pendingAppId]);

  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  // ログアウト処理
  const handleLogout = async () => {
    await AuthAdapter.signOut();
  };

  // タイルクリック処理
  const handleTileClick = (appId: string) => {
    const appConfig = APPS_REGISTRY[appId];
    
    // [OPTIMISTIC 起動許可] 
    // キャッシュがある状態（OPTIMISTIC）でも、ユーザー体験を優先して即時起動を許可する。
    // もし後続の検証で失敗した場合は、親コンポーネント（App.tsx）の authStatus 変更により
    // 自動的にログアウト画面へ戻される。

    // 内部モジュール（APP_COMPONENTS に定義あり）かつ URL が null または相対パスの場合は
    // ステートベースの遷移（onAppSelect）を優先する
    if (onAppSelect) {
      onAppSelect(appId);
      return;
    }

    // 外部URLが設定されている場合の予備ルート
    if (appConfig?.url) {
      setRedirectUrl(appConfig.url);
      return;
    }
  };

  // ユーザー名の頭文字を取得（アバター用）
  const getInitials = (name: string | undefined) => {
    if (!name) return '?';
    return name.charAt(0);
  };

  // 読み込み中
  if (isLoading) {
    return (
      <div className="dxos-portal" style={{ justifyContent: 'center' }}>
        <div className="dxos-portal__header">
          <div className="dxos-portal__logo-mark">
            <Hexagon size={28} color="#fff" />
          </div>
          <p className="dxos-portal__subtitle">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dxos-portal">
      {/* ヘッダー: OSロゴとタイトル */}
      <header className="dxos-portal__header">
        <div className="dxos-portal__logo-mark">
          <Hexagon size={28} color="#fff" />
        </div>
        <h1 className="dxos-portal__title">TBNY DXOS</h1>
        <p className="dxos-portal__subtitle">坪野谷紙業 厚木事業所 業務基盤OS</p>
      </header>

      {/* ユーザー情報バー */}
      {(currentUser || authStatus === 'OPTIMISTIC') && (
        <div className="dxos-portal__user-bar">
          <div className="dxos-portal__user-avatar">
            {getInitials(currentUser?.name)}
          </div>
          <span className="dxos-portal__user-name">
            {currentUser?.name || 'スタッフ'}
          </span>
          {currentUser?.role && (
            <span className="dxos-portal__user-role">{currentUser.role}</span>
          )}
          {authStatus === 'OPTIMISTIC' && (
            <span className="dxos-portal__sync-status">同期中...</span>
          )}
          <button
            className="dxos-portal__logout-btn"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            ログアウト
          </button>
        </div>
      )}

      {/* アプリタイルグリッド */}
      {authStatus === 'OPTIMISTIC' ? (
        <div className="dxos-portal__grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonTile key={i} />
          ))}
        </div>
      ) : authorizedTiles.length > 0 ? (
        <div className="dxos-portal__grid">
          {authorizedTiles.map((app) => {
            const IconComponent = ICON_MAP[app.icon] || LayoutDashboard;
            return (
              <button
                key={app.id}
                className={`dxos-tile ${pendingAppId === app.id ? 'pending' : ''}`}
                onClick={() => handleTileClick(app.id)}
                disabled={pendingAppId !== null && pendingAppId !== app.id}
                type="button"
                style={{
                  '--tile-gradient': `linear-gradient(135deg, ${app.gradientFrom}, ${app.gradientTo})`,
                  '--tile-glow': `${app.color}20`,
                } as React.CSSProperties}
              >
                <div className="dxos-tile__icon-wrapper">
                  {pendingAppId === app.id ? (
                    <div className="dxos-tile__loader"></div>
                  ) : (
                    <IconComponent />
                  )}
                </div>
                <h2 className="dxos-tile__label">
                  {pendingAppId === app.id ? '確認中...' : app.label}
                </h2>
                <p className="dxos-tile__description">
                  {pendingAppId === app.id ? '権限を最終確認しています' : app.description}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="dxos-portal__empty">
          <ShieldAlert className="dxos-portal__empty-icon" />
          <h2 className="dxos-portal__empty-title">
            アクセス権限がありません
          </h2>
          <p className="dxos-portal__empty-message">
            利用可能なアプリケーションが見つかりません。<br />
            管理者にお問い合わせください。
          </p>
        </div>
      )}

      {/* フッター */}
      <footer className="dxos-portal__footer">
        TBNY DXOS — 坪野谷紙業株式会社 厚木事業所
      </footer>
    </div>
  );
};
