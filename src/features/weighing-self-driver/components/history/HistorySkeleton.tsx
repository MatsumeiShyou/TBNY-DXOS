import React from 'react';

const HistorySkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
          <div className="flex items-center">
            <div className="flex-1 space-y-3 pr-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
            <div className="w-1/4 space-y-2 text-right">
               <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full ml-auto"></div>
               <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full ml-auto"></div>
            </div>
            <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full ml-4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistorySkeleton;
