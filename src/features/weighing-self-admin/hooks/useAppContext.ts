import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import type { AppContextValue } from '../types';

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
