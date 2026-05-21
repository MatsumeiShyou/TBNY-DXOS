import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, id, children, className, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="tw-block tw-text-sm tw-font-medium tw-text-slate-700 dark:text-slate-300 tw-mb-1">
        {label}
      </label>
      <select
        id={id}
        className={`tw-w-full tw-px-3 tw-py-2.5 tw-border tw-border-slate-300 dark:border-slate-600 tw-rounded-md tw-shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tw-bg-white dark:bg-slate-700 tw-text-slate-900 dark:text-slate-200 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;