
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
          <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
          </label>
      )}
      <div className={`relative flex items-stretch ${className}`}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          className="px-4 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-l-md border border-r-0 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          aria-label={`Decrement by ${step}`}
        >
          <Minus size={16} />
        </button>
        <div className="relative flex-grow">
          <input
            id={id}
            type="number"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-3 py-2.5 border-y border-x-0 border-slate-300 dark:border-slate-600 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-700/50 ${
              unit ? 'pr-12' : ''
            }`}
            style={{ MozAppearance: 'textfield' }}
            min={min}
            {...props}
          />
          {unit && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-slate-500 dark:text-slate-300 sm:text-sm">{unit}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          className="px-4 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          aria-label={`Increment by ${step}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default NumberInput;