
import React from 'react';
import Spinner from '../ui/Spinner';

interface FullScreenLoaderProps {
  message?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message = "読み込み中..." }) => {
  return (
    <div className="fixed inset-0 bg-white/75 dark:bg-slate-900/75 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <Spinner />
      <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold">{message}</p>
    </div>
  );
};

export default FullScreenLoader;
