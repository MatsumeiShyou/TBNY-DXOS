import React from 'react';
import { NAV_ITEMS } from '../../constants';
import type { ViewName } from '../../types';
import { Weight, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewName;
  setCurrentView: (view: ViewName) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, setCurrentView }) => {

  const sidebarContent = (
    <div className="tw-flex tw-flex-col tw-h-full tw-bg-background-secondary tw-border-r tw-border-border-default">
        <div className="tw-h-16 tw-flex tw-items-center tw-justify-between tw-px-6 tw-border-b tw-border-border-default tw-shrink-0">
            <div className="tw-flex tw-items-center">
                <Weight className="tw-w-8 tw-h-8 tw-text-interactive-default" />
                <h1 className="tw-ml-3 tw-text-xl tw-font-bold tw-text-text-primary">セルフ計量記録</h1>
            </div>
            <button onClick={onClose} className="md:tw-hidden tw-p-2 tw-rounded-full hover:tw-bg-background-tertiary">
                <X className="tw-w-6 tw-h-6 tw-text-text-primary" />
            </button>
        </div>
        <nav className="tw-flex-1 tw-px-4 tw-py-4 tw-overflow-y-auto">
        <ul className="tw-list-none tw-p-2 tw-m-0 tw-space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => setCurrentView(item.view)}
                className={`tw-w-full tw-flex tw-items-center tw-px-4 tw-py-3 tw-text-sm tw-font-bold tw-rounded-xl tw-transition-all tw-duration-300 ${
                  currentView === item.view
                    ? 'tw-bg-blue-50 tw-text-blue-600 tw-shadow-sm tw-border tw-border-blue-100 tw-dark:bg-slate-900 tw-dark:text-blue-400 tw-dark:border-slate-800 tw-dark:shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'tw-text-slate-500 tw-bg-transparent hover:tw-bg-slate-50 hover:tw-text-slate-800 tw-border tw-border-transparent tw-dark:text-slate-400 tw-dark:hover:bg-slate-800/50 tw-dark:hover:text-slate-200'
                }`}
              >
                <item.icon className="tw-w-5 tw-h-5 tw-mr-3" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Overlay) */}
      <div 
        className={`tw-fixed tw-inset-0 tw-z-40 tw-transition-opacity tw-duration-300 md:tw-hidden ${isOpen ? 'tw-opacity-100' : 'tw-opacity-0 tw-pointer-events-none'}`}
      >
        <div className="tw-absolute tw-inset-0 tw-bg-black/50" onClick={onClose}></div>
        <aside 
            className={`tw-relative tw-z-10 tw-w-64 tw-h-full tw-transform tw-transition-transform tw-duration-300 tw-ease-in-out ${isOpen ? 'tw-translate-x-0' : '-tw-translate-x-full'}`}
        >
          {sidebarContent}
        </aside>
      </div>

      {/* Desktop Sidebar (Static) */}
      <aside className="tw-w-64 tw-flex-col tw-hidden md:tw-flex tw-shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
