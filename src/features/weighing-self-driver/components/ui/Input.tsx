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
      <label htmlFor={id} className="tw-block tw-text-sm tw-font-medium tw-text-slate-700 dark:text-slate-300 tw-mb-1">
        {label}
      </label>
      <div className="tw-relative">
        <input
          id={id}
          className={`tw-w-full tw-px-3 tw-py-2.5 tw-border tw-border-slate-300 dark:border-slate-600 tw-rounded-md tw-shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tw-bg-white dark:bg-slate-700 tw-text-slate-900 dark:text-slate-200 tw-placeholder-slate-400 dark:placeholder-slate-500 ${unit || endIcon ? 'tw-pr-10' : ''} ${className}`}
          {...props}
        />
        <div className="tw-absolute tw-inset-y-0 tw-right-0 tw-pr-3 tw-flex tw-items-center">
          {endIcon && onEndIconClick ? (
            <button
              type="button"
              onClick={onEndIconClick}
              className="tw-text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
              aria-label="Toggle password visibility"
              tabIndex={-1}
            >
              {endIcon}
            </button>
          ) : unit ? (
            <span className="tw-text-slate-500 dark:text-slate-300 sm:text-sm">{unit}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Input;