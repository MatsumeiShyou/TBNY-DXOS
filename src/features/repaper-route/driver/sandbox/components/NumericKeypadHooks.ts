import { createContext, useContext } from 'react';

export interface NumericKeypadContextType {
  isOpen: boolean;
  value: string;
  label: string;
  unit: string;
  open: (config: { initialValue: string | number; label: string; unit: string; onConfirm: (value: number) => void }) => void;
  close: () => void;
  onInput: (char: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onCalculate: () => void;
}

export const NumericKeypadContext = createContext<NumericKeypadContextType | undefined>(undefined);

export const useNumericKeypad = () => {
  const context = useContext(NumericKeypadContext);
  if (!context) throw new Error('useNumericKeypad must be used within a NumericKeypadProvider');
  return context;
};
