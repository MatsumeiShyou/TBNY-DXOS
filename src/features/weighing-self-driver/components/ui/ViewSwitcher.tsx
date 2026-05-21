import React from 'react';
import { LayoutGrid, Clock } from 'lucide-react';

export type ListViewMode = 'grouped' | 'list';

interface ViewSwitcherProps {
  currentView: ListViewMode;
  onViewChange: (view: ListViewMode) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const commonButtonClasses = "tw-flex tw-items-center tw-justify-center tw-p-3 tw-rounded-lg tw-transition-colors tw-duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500";
  const activeButtonClasses = "tw-bg-slate-700 dark:bg-slate-600 tw-text-white";
  const inactiveButtonClasses = "tw-bg-slate-200 dark:bg-slate-800 tw-text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700";

  return (
    <div className="tw-flex tw-space-x-1">
      <button
        onClick={() => onViewChange('grouped')}
        className={`${commonButtonClasses} ${currentView === 'grouped' ? activeButtonClasses : inactiveButtonClasses}`}
        aria-pressed={currentView === 'grouped'}
        aria-label="グループ表示"
        title="グループ表示"
      >
        <LayoutGrid size={22} />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`${commonButtonClasses} ${currentView === 'list' ? activeButtonClasses : inactiveButtonClasses}`}
        aria-pressed={currentView === 'list'}
        aria-label="時系列表示"
        title="時系列表示"
      >
        <Clock size={22} />
      </button>
    </div>
  );
};

export default ViewSwitcher;