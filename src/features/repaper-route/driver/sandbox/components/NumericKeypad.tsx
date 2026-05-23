
/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { useNumericKeypad } from './NumericKeypadContext';
import { Delete } from 'lucide-react';

// Safe Calculator Parser
export const safeCalculate = (expression: string): number => {
  try {
    if (!expression) return 0;
    const tokens = expression.match(/(\d+|[+\-×÷])/g);
    if (!tokens) return 0;
    const intermediate: (string | number)[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === '×' || token === '÷') {
         const prevVal = intermediate.pop();
         const nextToken = tokens[++i];
         const n1 = Number(prevVal);
         const n2 = Number(nextToken);
         if (!isNaN(n1) && !isNaN(n2)) {
           if (token === '×') intermediate.push(n1 * n2);
           if (token === '÷') intermediate.push(n2 === 0 ? 0 : n1 / n2);
         } else {
           intermediate.push(prevVal || 0);
         }
      } else {
         intermediate.push(token);
      }
    }
    let total = Number(intermediate[0] || 0);
    for (let i = 1; i < intermediate.length; i += 2) {
       const op = intermediate[i];
       const val = Number(intermediate[i+1]);
       if (!isNaN(val)) {
          if (op === '+') total += val;
          if (op === '-') total -= val;
       }
    }
    if (!isFinite(total) || isNaN(total)) return 0;
    return Math.round(total);
  } catch (e) {
    console.error("Calc Error", e);
    return 0;
  }
};

export const NumericKeypad: React.FC = () => {
  const { isOpen, value, label, unit, onInput, onDelete, onClear, onCalculate, close } = useNumericKeypad();

  if (!isOpen) return null;

  const rows = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '⌫', '=', '+'],
  ];

  const isOperator = (key: string) => ['+', '-', '×', '÷'].includes(key);

  const handlePress = (key: string) => {
    if (key === '⌫') {
      onDelete();
    } else if (key === '=') {
      onCalculate();
    } else {
      onInput(key);
    }
  };

  return (
    <div className="tw-fixed tw-inset-x-0 tw-bottom-0 tw-z-[9999] tw-bg-slate-100 tw-shadow-[0_-4px_20px_rgba(0,0,0,0.15)] tw-rounded-t-3xl tw-pb-safe tw-animate-slide-up tw-select-none">
      {/* Header / Done Button */}
      <div className="tw-flex tw-justify-between tw-items-center tw-bg-white tw-p-2 tw-px-6 tw-border-b tw-border-slate-200 tw-rounded-t-3xl tw-min-h-[60px]">
        <div className="tw-flex tw-flex-col">
           <span className="tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">{label || '電卓入力'}</span>
           <div className="tw-flex tw-items-baseline tw-space-x-1">
             <span className="tw-text-xl tw-font-mono tw-font-bold tw-text-primary">{value}</span>
             <span className="tw-text-xs tw-text-slate-400 tw-font-bold">{unit}</span>
           </div>
        </div>
        <div className="tw-flex tw-items-center tw-space-x-3">
          <button onClick={onClear} className="tw-text-xs tw-bg-slate-100 tw-text-slate-500 tw-px-3 tw-py-2 tw-rounded-lg tw-font-bold active:tw-bg-slate-200">
            クリア
          </button>
          <button 
            onClick={close} 
            className="tw-bg-primary tw-text-white tw-font-bold tw-text-base tw-px-6 tw-py-2 tw-rounded-xl tw-shadow-md active:tw-opacity-80 tw-min-h-[44px]"
          >
            完了
          </button>
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="tw-p-3 tw-bg-slate-100">
        <div className="tw-grid tw-grid-cols-4 tw-gap-2.5">
          {rows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handlePress(key)}
                  className={`
                    tw-h-16 tw-rounded-2xl tw-text-2xl tw-font-bold tw-shadow-sm tw-border-b-4 tw-transition-all tw-touch-manipulation tw-flex tw-items-center tw-justify-center tw-active:tw-border-b-0 tw-active:tw-translate-y-[2px]
                    ${isOperator(key) 
                      ? 'tw-bg-blue-50 tw-text-blue-600 tw-border-blue-200 tw-active:tw-bg-blue-100' 
                      : key === '=' 
                        ? 'tw-bg-primary tw-text-white tw-border-blue-800 tw-active:tw-bg-blue-700'
                        : key === '⌫'
                          ? 'tw-bg-slate-200 tw-text-slate-600 tw-border-slate-300 tw-active:tw-bg-slate-300 tw-text-xl'
                          : 'tw-bg-white tw-text-slate-800 tw-border-slate-300 tw-active:tw-bg-slate-50'
                    }
                  `}
                >
                  {key === '⌫' ? <Delete size={24} /> : key}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
