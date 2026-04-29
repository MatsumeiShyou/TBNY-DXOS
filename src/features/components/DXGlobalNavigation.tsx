import { ArrowLeft, Hexagon } from 'lucide-react';
import '../../shared/styles/navigation.css';

interface DXGlobalNavigationProps {
    currentAppLabel: string;
    onBackToPortal: () => void;
}

/**
 * DXGlobalNavigation — 全アプリ共通のポータル回帰ヘッダー
 *
 * 各モジュール（配車管理、ドライバーアプリ等）の最上部に配置し、
 * いつでもDXOSポータルへ戻れる物理的な導線を提供する。
 */
export const DXGlobalNavigation = ({ currentAppLabel, onBackToPortal }: DXGlobalNavigationProps) => {
  return (
    <nav className="dx-nav">
      <button
        onClick={onBackToPortal}
        className="dx-nav__back-btn"
        type="button"
        aria-label="DXOSポータルへ戻る"
      >
        <ArrowLeft size={16} />
        <Hexagon size={14} />
        <span>DXOSへ戻る</span>
      </button>

      {currentAppLabel && (
        <span className="dx-nav__app-label">{currentAppLabel}</span>
      )}
    </nav>
  );
};
