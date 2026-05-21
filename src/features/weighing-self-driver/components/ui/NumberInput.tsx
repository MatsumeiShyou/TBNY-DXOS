
import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange' | 'disabled'> {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  unit?: string;
  step?: number;
  min?: number;
  className?: string;
  disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  id,
  label,
  value,
  onChange,
  unit,
  step = 10,
  min = 0,
  className,
  disabled = false,
  ...props
}) => {
  const handleValueChange = (newValue: number) => {
    // Simulate a change event
    const event = {
      target: {
        value: String(newValue),
        name: id,
        id,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  const handleDecrement = () => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      handleValueChange(Math.max(min, numValue - step));
    }
  };

  const handleIncrement = () => {
    const numValue = parseInt(value, 10) || 0;
    handleValueChange(numValue + step);
  };

  const numValue = parseInt(value, 10);
  const isDecrementDisabled = disabled || (!isNaN(numValue) && numValue <= min);
  const isIncrementDisabled = disabled;

  return (
    <div>
      {label && (
          <label htmlFor={id} className="tw-block tw-text-sm tw-font-medium tw-text-slate-700 dark:text-slate-300 tw-mb-1">
            {label}
          </label>
      )}
      <div className={`tw-relative tw-flex tw-items-stretch ${className}`}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          className="tw-px-4 tw-bg-slate-100 dark:bg-slate-700 tw-text-slate-800 dark:text-slate-200 tw-rounded-l-md tw-border tw-border-r-0 tw-border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed tw-transition-colors tw-flex tw-items-center tw-justify-center"
          aria-label={`Decrement by ${step}`}
        >
          <Minus size={16} />
        </button>
        <div className="tw-relative tw-flex-grow">
          <input
            id={id}
            type="number"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`tw-w-full tw-px-3 tw-py-2.5 tw-border-y tw-border-x-0 tw-border-slate-300 dark:border-slate-600 tw-text-center tw-text-lg tw-font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tw-bg-white dark:bg-slate-700 tw-text-slate-900 dark:text-slate-50 tw-placeholder-slate-400 dark:placeholder-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-700/50 ${
              unit ? 'tw-pr-12' : ''
            }`}
            style={{ MozAppearance: 'textfield' }}
            min={min}
            {...props}
          />
          {unit && (
            <div className="tw-absolute tw-inset-y-0 tw-right-0 tw-pr-3 tw-flex tw-items-center tw-pointer-events-none">
              <span className="tw-text-slate-500 dark:text-slate-300 sm:text-sm">{unit}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          className="tw-px-4 tw-bg-slate-100 dark:bg-slate-700 tw-text-slate-800 dark:text-slate-200 tw-rounded-r-md tw-border tw-border-l-0 tw-border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed tw-transition-colors tw-flex tw-items-center tw-justify-center"
          aria-label={`Increment by ${step}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default NumberInput;