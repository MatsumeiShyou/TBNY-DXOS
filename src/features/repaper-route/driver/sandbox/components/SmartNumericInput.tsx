
import React from 'react';
import { useNumericKeypad } from './NumericKeypadContext';

interface Props {
  value: string | number;
  onChange: (value: number) => void;
  label: string;
  unit: string;
  placeholder?: string;
  className?: string;
  agentId?: string;
}

export const SmartNumericInput: React.FC<Props> = ({ value, onChange, label, unit, placeholder, className, agentId }) => {
  const keypad = useNumericKeypad();

  const handleClick = () => {
    keypad.open({
      initialValue: value,
      label,
      unit,
      onConfirm: onChange
    });
  };

  return (
    <div className={`tw-relative tw-group ${className}`}>
      <input
        type="text"
        readOnly
        value={value}
        onClick={handleClick}
        placeholder={placeholder}
        data-agent-id={agentId}
        className="tw-w-full tw-bg-slate-50 tw-border-2 tw-border-slate-200 tw-rounded-2xl tw-p-5 tw-text-2xl tw-font-mono tw-font-bold tw-shadow-sm focus:tw-border-blue-500 focus:tw-bg-white focus:tw-outline-none tw-transition-all tw-caret-transparent"
      />
      <div className="tw-absolute tw-right-5 tw-top-1/2 tw--translate-y-1/2 tw-flex tw-items-center tw-space-x-2 tw-pointer-events-none">
        <span className="tw-text-slate-400 tw-font-bold tw-text-xl">{unit}</span>
      </div>
      <div className="tw-absolute tw-left-5 tw-top-2 tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider">
        {label}
      </div>
    </div>
  );
};
