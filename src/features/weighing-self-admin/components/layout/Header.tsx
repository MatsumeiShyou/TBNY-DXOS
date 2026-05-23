/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon, Monitor, Menu } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const { mode, setMode } = useTheme();

    const options = [
        { name: 'light', icon: Sun, label: 'ライトモード' },
        { name: 'dark', icon: Moon, label: 'ダークモード' },
        { name: 'system', icon: Monitor, label: 'システム設定' },
    ];

    return (
        <div className="tw-flex tw-items-center tw-p-1 tw-rounded-full tw-bg-slate-100 tw-dark:bg-slate-800/50">
            {options.map((option) => (
                <button
                    key={option.name}
                    onClick={() => setMode(option.name as any)}
                    className={`tw-p-1.5 tw-rounded-full tw-transition-all tw-duration-300 ${mode === option.name ? 'tw-bg-white tw-shadow-sm tw-text-slate-800 tw-dark:bg-blue-600 tw-dark:text-white tw-dark:shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'tw-text-slate-400 hover:tw-text-slate-600 tw-dark:text-slate-500 tw-dark:hover:text-slate-300'}`}
                    aria-label={option.label}
                >
                    <option.icon className="tw-w-5 tw-h-5" />
                </button>
            ))}
        </div>
    );
};

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="tw-flex tw-items-center tw-justify-between tw-h-16 tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-bg-background-secondary tw-border-b tw-border-border-default tw-shrink-0">
      <div className="tw-flex tw-items-center">
        <button onClick={onMenuClick} className="md:tw-hidden tw-mr-4 tw-p-2 tw-rounded-full hover:tw-bg-background-tertiary">
            <Menu className="tw-w-6 tw-h-6 tw-text-text-primary" />
        </button>
      </div>
      <div className="tw-flex tw-items-center tw-gap-4">
        <ThemeToggle />
        <div className="tw-flex tw-items-center tw-gap-2">
            <div className="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-blue-400 tw-to-indigo-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold">
                A
            </div>
            <div className="tw-hidden sm:tw-block">
                <p className="tw-font-semibold tw-text-sm">admin</p>
                <p className="tw-text-xs tw-text-text-secondary">システム管理者</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
