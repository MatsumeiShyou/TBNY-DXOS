import React from 'react';

interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, label, description, checked, onChange }) => {
  return (
    <div className="tw-flex tw-items-center tw-justify-between">
      <div className="tw-pr-4 tw-flex-1">
        <label htmlFor={id} className="tw-font-medium tw-text-slate-800 dark:text-slate-200 tw-cursor-pointer">
          {label}
        </label>
        {description && <p className="tw-text-sm tw-text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`tw-relative tw-inline-flex tw-items-center tw-h-6 tw-rounded-full tw-w-11 tw-transition-colors tw-duration-200 tw-ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 tw-flex-shrink-0 ${
          checked ? 'tw-bg-blue-600' : 'tw-bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`tw-inline-block tw-w-4 tw-h-4 tw-transform tw-bg-white tw-rounded-full tw-transition-transform tw-duration-200 tw-ease-in-out ${
            checked ? 'tw-translate-x-6' : 'tw-translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;