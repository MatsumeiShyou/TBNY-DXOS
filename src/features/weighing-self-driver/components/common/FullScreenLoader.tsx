
import React from 'react';
import Spinner from '../ui/Spinner';

interface FullScreenLoaderProps {
  message?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message = "読み込み中..." }) => {
  return (
    <div className="tw-fixed tw-inset-0 tw-bg-white/75 dark:bg-slate-900/75 tw-backdrop-blur-sm tw-flex tw-flex-col tw-items-center tw-justify-center tw-z-50">
      <Spinner />
      <p className="tw-mt-4 tw-text-slate-600 dark:text-slate-300 tw-font-semibold">{message}</p>
    </div>
  );
};

export default FullScreenLoader;
