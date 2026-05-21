
import React from 'react';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <div className={`tw-bg-white dark:bg-slate-800 tw-shadow-lg tw-rounded-xl tw-p-6 md:p-8 tw-border tw-border-slate-200 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card;