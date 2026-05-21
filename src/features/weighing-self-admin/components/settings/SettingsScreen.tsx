import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon, Monitor, LogOut } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { ThemeMode } from '../../types';

const ThemeSelector: React.FC = () => {
    const { mode, setMode } = useTheme();

    const options: { name: ThemeMode; icon: React.ElementType; label: string }[] = [
        { name: 'light', icon: Sun, label: 'ライト' },
        { name: 'dark', icon: Moon, label: 'ダーク' },
        { name: 'system', icon: Monitor, label: 'システム' },
    ];

    return (
        <div className="tw-grid tw-grid-cols-3 tw-gap-4">
            {options.map((option) => (
                <button
                    key={option.name}
                    onClick={() => setMode(option.name)}
                    className={`tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-2 tw-p-4 tw-rounded-lg tw-transition-all tw-duration-200 tw-border-2 ${
                        mode === option.name 
                        ? 'tw-bg-interactive-default/10 tw-border-interactive-default tw-text-interactive-default tw-shadow-sm' 
                        : 'tw-bg-background-tertiary tw-border-transparent tw-text-text-secondary hover:tw-border-border-default hover:tw-bg-background-secondary'
                    }`}
                >
                    <option.icon className="tw-w-6 tw-h-6" />
                    <span className="tw-text-sm tw-font-semibold">{option.label}</span>
                </button>
            ))}
        </div>
    );
};

const SettingsScreen: React.FC = () => {
  return (
    <div className="tw-space-y-8 tw-max-w-3xl tw-mx-auto">
      <div>
        <h1 className="tw-text-3xl tw-font-bold">設定</h1>
        <p className="tw-text-text-secondary tw-mt-1">アプリケーションの表示やアカウント情報を管理します。</p>
      </div>

      <Card className="tw-p-6">
        <h2 className="tw-text-xl tw-font-semibold tw-mb-2">表示設定</h2>
        <p className="tw-text-sm tw-text-text-secondary tw-mb-4">アプリケーション全体の配色（テーマ）を選択します。</p>
        <ThemeSelector />
      </Card>

      <Card className="tw-p-6">
        <h2 className="tw-text-xl tw-font-semibold tw-mb-4">アカウント</h2>
        <div className="tw-flex tw-items-center tw-justify-between">
            <div className="tw-flex tw-items-center tw-gap-4">
                <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-blue-400 tw-to-indigo-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-lg">
                    A
                </div>
                <div>
                    <p className="tw-font-semibold tw-text-lg">admin</p>
                    <p className="tw-text-sm tw-text-text-secondary">システム管理者</p>
                </div>
            </div>
            <Button variant="outline" icon={<LogOut className="tw-w-4 tw-h-4" />}>
                ログアウト
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsScreen;
