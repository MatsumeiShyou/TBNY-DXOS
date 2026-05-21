
import React from 'react';
import { GaugeCircle, History, Settings } from 'lucide-react';
import type { AppView } from '../../WeighingSelfDriverApp';

interface FooterProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { view: 'weighing', label: '計量記録', icon: GaugeCircle },
    { view: 'history', label: '履歴', icon: History },
    { view: 'settings', label: '設定', icon: Settings },
  ] as const;

  return (
    <footer className="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white dark:bg-slate-800 tw-border-t tw-border-slate-200 dark:border-slate-600 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] tw-z-30">
      <div className="tw-container tw-mx-auto tw-px-4 tw-h-16 tw-flex tw-justify-around tw-items-center">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-24 tw-h-full tw-transition-colors tw-duration-200 ${
                isActive ? 'tw-text-blue-600 dark:text-blue-400' : 'tw-text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Icon size={24} />
              <span className={`tw-text-xs tw-mt-1 ${isActive ? 'tw-font-bold' : 'tw-font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;