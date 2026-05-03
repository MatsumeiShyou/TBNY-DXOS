
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
    <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] rounded-t-2xl pb-safe animate-slide-up select-none">
      {/* Header / Done Button */}
      <div className="flex justify-between items-center bg-white p-2 px-4 border-b border-slate-200 rounded-t-2xl min-h-[50px]">
        <div className="flex items-center space-x-2">
           <span className="text-xs font-bold text-slate-400">電卓入力</span>
           <button onClick={onClear} className="text-xs bg-slate-200 text-slate-600 px-3 py-1.5 rounded font-bold active:bg-slate-300">
             クリア
           </button>
        </div>
        <button 
          onClick={onClose} 
          className="text-primary font-bold text-lg px-4 py-2 active:opacity-50 min-h-[44px]"
        >
          完了
        </button>
      </div>

      {/* Keypad Grid */}
      <div className="p-2 bg-slate-100">
        <div className="grid grid-cols-4 gap-2">
          {rows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handlePress(key)}
                  className={`
                    h-16 rounded-xl text-2xl font-bold shadow-sm border-b-2 transition-all touch-manipulation flex items-center justify-center active:border-b-0 active:translate-y-[2px]
                    ${isOperator(key) 
                      ? 'bg-blue-50 text-blue-600 border-blue-200 active:bg-blue-100' 
                      : key === '=' 
                        ? 'bg-primary text-white border-blue-800 active:bg-blue-700'
                        : key === '⌫'
                          ? 'bg-slate-200 text-slate-600 border-slate-300 active:bg-slate-300 text-xl'
                          : 'bg-white text-slate-800 border-slate-300 active:bg-slate-50'
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
