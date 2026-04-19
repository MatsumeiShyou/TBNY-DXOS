import React from 'react';
import { ArrowLeft, Hexagon } from 'lucide-react';

/**
 * DXGlobalNavigation — 全アプリ共通のポータル回帰ヘッダー
 *
 * 各モジュール（配車管理、ドライバーアプリ等）の最上部に配置し、
 * いつでもDXOSポータルへ戻れる物理的な導線を提供する。
 *
 * @param {Object} props
 * @param {string} props.currentAppLabel - 現在表示中のアプリ名
 * @param {function} props.onBackToPortal - ポータルへ戻るコールバック
 */
export const DXGlobalNavigation = ({ currentAppLabel, onBackToPortal }) => {
  return (
    <nav style={styles.nav}>
      <button
        onClick={onBackToPortal}
        style={styles.backButton}
        type="button"
        aria-label="DXOSポータルへ戻る"
      >
        <ArrowLeft size={16} />
        <Hexagon size={14} />
        <span>DXOSへ戻る</span>
      </button>

      {currentAppLabel && (
        <span style={styles.appLabel}>{currentAppLabel}</span>
      )}
    </nav>
  );
};

/**
 * インラインスタイル（単一コンポーネントのため CSS ファイル分離不要）
 */
const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem 1.25rem',
    background: 'rgba(11, 13, 20, 0.95)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(8px)',
    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
    zIndex: 1000,
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#94a3b8',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  appLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#cbd5e1',
    letterSpacing: '-0.01em',
  },
};
