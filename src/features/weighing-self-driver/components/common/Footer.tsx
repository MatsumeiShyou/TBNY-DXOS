
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
    <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-600 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-30">
      <div className="container mx-auto px-4 h-16 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center justify-center w-24 h-full transition-colors duration-200 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Icon size={24} />
              <span className={`text-xs mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;