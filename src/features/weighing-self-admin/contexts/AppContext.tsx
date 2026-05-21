/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, type ReactNode } from 'react';
import type { AppContextValue } from '../types';

export const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const withStatusHandling = useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const newError = err instanceof Error ? err : new Error('An unknown error occurred');
      console.error("Global error handler caught:", newError);
      setError(newError);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AppContext.Provider value={{ isLoading, error, withStatusHandling, clearError }}>
      {children}
    </AppContext.Provider>
  );
};
