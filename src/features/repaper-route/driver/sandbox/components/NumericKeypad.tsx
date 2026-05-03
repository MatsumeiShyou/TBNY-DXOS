
import React from 'react';

interface KeypadProps {
  isVisible: boolean;
  onInput: (char: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onCalculate: () => void;
  onClose: () => void;
}

// Safe Calculator Parser
export const safeCalculate = (expression: string): number => {
  try {
    if (!expression) return 0;

    // 1. Tokenize (Split by operators, keep operators)
    const tokens = expression.match(/(\d+|[\+\-\×\÷])/g);
    if (!tokens) return 0;

    // 2. Process Multiply (×) and Divide (÷) first
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

    // 3. Process Add (+) and Subtract (-)
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

export const NumericKeypad: React.FC<KeypadProps> = ({ isVisible, onInput, onDelete, onClear, onCalculate, onClose }) => {
  if (!isVisible) return null;

  // 4x4 Grid Layout
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
    <div className="tw-fixed tw-inset-x-0 tw-bottom-0 tw-z-50 tw-bg-slate-100 tw-shadow-[0_-4px_20px_rgba(0,0,0,0.15)] tw-rounded-t-2xl tw-pb-safe tw-animate-slide-up tw-select-none">
      {/* Header / Done Button */}
      <div className="tw-flex tw-justify-between tw-items-center tw-bg-white tw-p-2 tw-px-4 tw-border-b tw-border-slate-200 tw-rounded-t-2xl tw-min-h-[50px]">
        <div className="tw-flex tw-items-center tw-space-x-2">
           <span className="tw-text-xs tw-font-bold tw-text-slate-400">電卓入力</span>
           <button onClick={onClear} className="tw-text-xs tw-bg-slate-200 tw-text-slate-600 tw-px-3 tw-py-1.5 tw-rounded tw-font-bold active:tw-bg-slate-300">
             クリア
           </button>
        </div>
        <button 
          onClick={onClose} 
          className="tw-text-primary tw-font-bold tw-text-lg tw-px-4 tw-py-2 active:tw-opacity-50 tw-min-h-[44px]"
        >
          完了
        </button>
      </div>

      {/* Keypad Grid */}
      <div className="tw-p-2 tw-bg-slate-100">
        <div className="tw-grid tw-grid-cols-4 tw-gap-2">
          {rows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handlePress(key)}
                  className={`
                    tw-h-16 tw-rounded-xl tw-text-2xl tw-font-bold tw-shadow-sm tw-border-b-2 tw-transition-all tw-touch-manipulation tw-flex tw-items-center tw-justify-center active:tw-border-b-0 active:tw-translate-y-[2px]
                    ${isOperator(key) 
                      ? 'tw-bg-blue-50 tw-text-blue-600 tw-border-blue-200 active:tw-bg-blue-100' 
                      : key === '=' 
                        ? 'tw-bg-primary tw-text-white tw-border-blue-800 active:tw-bg-blue-700'
                        : key === '⌫'
                          ? 'tw-bg-slate-200 tw-text-slate-600 tw-border-slate-300 active:tw-bg-slate-300 tw-text-xl'
                          : 'tw-bg-white tw-text-slate-800 tw-border-slate-300 active:tw-bg-slate-50'
                    }
                  `}
                >
                  {key === '⌫' ? <i className="fa-solid fa-delete-left"></i> : key}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
