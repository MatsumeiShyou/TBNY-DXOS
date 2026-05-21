import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  unit?: string;
  endIcon?: React.ReactNode;
  onEndIconClick?: () => void;
}

const Input: React.FC<InputProps> = ({ label, id, unit, endIcon, onEndIconClick, className, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={`w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 ${unit || endIcon ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {endIcon && onEndIconClick ? (
            <button
              type="button"
              onClick={onEndIconClick}
              className="text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
              aria-label="Toggle password visibility"
              tabIndex={-1}
            >
              {endIcon}
            </button>
          ) : unit ? (
            <span className="text-slate-500 dark:text-slate-300 sm:text-sm">{unit}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Input;