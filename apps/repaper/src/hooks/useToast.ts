import { createContext, useContext } from 'react';

export interface ToastMessage {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastMessage['type']) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
