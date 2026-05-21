import React from 'react';

const HistorySkeleton: React.FC = () => {
  return (
    <div className="tw-space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="tw-bg-white dark:bg-slate-800 tw-shadow-md tw-rounded-xl tw-p-4 md:p-6 tw-border tw-border-slate-200 dark:border-slate-700 tw-animate-pulse">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-1 tw-space-y-3 tw-pr-4">
              <div className="tw-h-4 tw-bg-slate-200 dark:bg-slate-700 tw-rounded tw-w-3/4"></div>
              <div className="tw-h-3 tw-bg-slate-200 dark:bg-slate-700 tw-rounded tw-w-1/2"></div>
            </div>
            <div className="tw-w-1/4 tw-space-y-2 tw-text-right">
               <div className="tw-h-3 tw-bg-slate-200 dark:bg-slate-700 tw-rounded tw-w-full tw-ml-auto"></div>
               <div className="tw-h-6 tw-bg-slate-200 dark:bg-slate-700 tw-rounded tw-w-full tw-ml-auto"></div>
            </div>
            <div className="tw-h-6 tw-w-6 tw-bg-slate-200 dark:bg-slate-700 tw-rounded-full tw-ml-4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistorySkeleton;
