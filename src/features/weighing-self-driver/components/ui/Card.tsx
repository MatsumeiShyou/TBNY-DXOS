
import React from 'react';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card;