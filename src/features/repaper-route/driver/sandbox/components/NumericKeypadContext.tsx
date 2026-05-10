
import React, { createContext, useContext, useState, useCallback } from 'react';
import { safeCalculate } from './NumericKeypad';

interface NumericKeypadContextType {
  isOpen: boolean;
  value: string;
  label: string;
  unit: string;
  open: (config: { initialValue: string | number; label: string; unit: string; onConfirm: (value: number) => void }) => void;
  close: () => void;
  // Keypad Handlers
  onInput: (char: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onCalculate: () => void;
}

const NumericKeypadContext = createContext<NumericKeypadContextType | undefined>(undefined);

export const NumericKeypadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('0');
  const [label, setLabel] = useState('');
  const [unit, setUnit] = useState('');
  const [confirmCallback, setConfirmCallback] = useState<((val: number) => void) | null>(null);

  const open = useCallback((config: { initialValue: string | number; label: string; unit: string; onConfirm: (value: number) => void }) => {
    setValue(config.initialValue.toString());
    setLabel(config.label);
    setUnit(config.unit);
    setConfirmCallback(() => config.onConfirm);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (confirmCallback) {
      const result = safeCalculate(value);
      confirmCallback(result);
    }
    setIsOpen(false);
    setConfirmCallback(null);
  }, [confirmCallback, value]);

  const onInput = useCallback((char: string) => {
    const isOp = ['+', '-', '×', '÷'].includes(char);
    setValue(prev => {
      const lastChar = prev.slice(-1);
      const lastIsOp = ['+', '-', '×', '÷'].includes(lastChar);
      if (isOp && lastIsOp) return prev.slice(0, -1) + char;
      if (prev === '0' && !isOp) return char;
      return prev + char;
    });
  }, []);

  const onDelete = useCallback(() => {
    setValue(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  }, []);

  const onClear = useCallback(() => setValue('0'), []);

  const onCalculate = useCallback(() => {
    const result = safeCalculate(value);
    setValue(result.toString());
  }, [value]);

  return (
    <NumericKeypadContext.Provider value={{ isOpen, value, label, unit, open, close, onInput, onDelete, onClear, onCalculate }}>
      {children}
    </NumericKeypadContext.Provider>
  );
};

export const useNumericKeypad = () => {
  const context = useContext(NumericKeypadContext);
  if (!context) throw new Error('useNumericKeypad must be used within a NumericKeypadProvider');
  return context;
};
