import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Truck,
  Database,
  Scale,
  BarChart3,
  ShieldAlert,
  LogOut,
  Hexagon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { APPS_REGISTRY } from '../config/appsRegistry';
import '../styles/portal.css';

/**
 * アイコン名と Lucide コンポーネントの対応マップ。
 * appsRegistry.js で定義された icon 文字列をコンポーネントに解決する。
 */
const ICON_MAP = {
  LayoutDashboard,
  Truck,
  Database,
  Scale,
  BarChart3,
};

/**
 * DXOSPortal — 基盤業務OSのランチャー画面
 *
 * staffs.allowed_apps に基づき、利用可能なアプリをタイルとして表示する。
 * 認証済みユーザーのみが到達する。
 *
 * @param {Object} props
 * @param {function} props.onAppSelect - タイルクリック時に app_id を渡すコールバック
 */
export const DXOSPortal = ({ onAppSelect }) => {
  const { currentUser } = useAuth();
  const [staffData, setStaffData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // staffs テーブルからログインユーザーの権限情報を取得
  useEffect(() => {
    const fetchStaffData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('staffs')
          .select('id, name, role, allowed_apps')
          .eq('auth_uid', currentUser.id)
          .single();

        if (error) {
          console.error('❌ スタッフ情報の取得に失敗:', error.message);
        }
        setStaffData(data);
      } catch (e) {
        console.error('❌ 予期しないエラー:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffData();
  }, [currentUser]);

  // allowed_apps に基づいて表示タイルを生成（order順にソート）
  const authorizedTiles = useMemo(() => {
    if (!staffData?.allowed_apps) return [];

    return staffData.allowed_apps
      .filter((appId) => APPS_REGISTRY[appId])
      .map((appId) => ({
        id: appId,
        ...APPS_REGISTRY[appId],
      }))
      .sort((a, b) => a.order - b.order);
  }, [staffData]);

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // タイルクリック処理
  const handleTileClick = async (appId) => {
    const appConfig = APPS_REGISTRY[appId];
    
    // 外部URLが設定されている場合は、そのままリダイレクト（Vite Proxyにより同一オリジンとしてルーティングされる）
    if (appConfig?.url) {
      window.location.href = appConfig.url;
      return;
    }

    // 内部モジュールの場合はコールバックを実行
    if (onAppSelect) {
      onAppSelect(appId);
    }
  };

  // ユーザー名の頭文字を取得（アバター用）
  const getInitials = (name) => {
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
      {staffData && (
        <div className="dxos-portal__user-bar">
          <div className="dxos-portal__user-avatar">
            {getInitials(staffData.name)}
          </div>
          <span className="dxos-portal__user-name">
            {staffData.name || 'スタッフ'}
          </span>
          {staffData.role && (
            <span className="dxos-portal__user-role">{staffData.role}</span>
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
      {authorizedTiles.length > 0 ? (
        <div className="dxos-portal__grid">
          {authorizedTiles.map((app) => {
            const IconComponent = ICON_MAP[app.icon] || LayoutDashboard;
            return (
              <button
                key={app.id}
                className="dxos-tile"
                onClick={() => handleTileClick(app.id)}
                type="button"
                style={{
                  '--tile-gradient': `linear-gradient(135deg, ${app.gradientFrom}, ${app.gradientTo})`,
                  '--tile-glow': `${app.color}20`,
                }}
              >
                <div className="dxos-tile__icon-wrapper">
                  <IconComponent />
                </div>
                <h2 className="dxos-tile__label">{app.label}</h2>
                <p className="dxos-tile__description">{app.description}</p>
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
