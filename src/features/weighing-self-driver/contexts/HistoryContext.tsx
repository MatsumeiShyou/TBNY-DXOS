/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { getHistory as fetchHistoryFromApi, updateWeighingRecord } from '../services/gasApi';
import { getHistory, saveHistory, updateHistoryRecord as updateHistoryDb } from '../services/db';
import { useWeighingAuth } from './WeighingAuthContext';
import { useToast } from './ToastContext';
import type { WeighingRecordPayload } from '../types';

interface HistoryContextType {
  history: WeighingRecordPayload[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  updateRecord: (record: WeighingRecordPayload) => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<WeighingRecordPayload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, driverName } = useWeighingAuth();
  const { addToast } = useToast();

  const fetchHistory = useCallback(async (silent = false) => {
    if (!driverName) return;

    if (!silent) setIsLoading(true);
    setError(null);

    try {
      // 1. Load from cache first for immediate display
      const cachedHistory = await getHistory();
      setHistory(cachedHistory);

      // 2. Then, fetch from API for fresh data
      const apiHistory = await fetchHistoryFromApi(driverName);
      setHistory(apiHistory);
      
      // 3. Update cache with fresh data
      await saveHistory(apiHistory);

    } catch (err) {
      const errorMessage = '履歴の取得に失敗しました。';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [driverName, addToast]);

  const updateRecord = useCallback(async (record: WeighingRecordPayload) => {
    try {
        await updateWeighingRecord(record);
        await updateHistoryDb(record);
        setHistory(prev => prev.map(r => r.recordId === record.recordId ? record : r));
        addToast('記録を更新しました。', 'success');
    } catch (err) {
        const errorMessage = '記録の更新に失敗しました。';
        addToast(errorMessage, 'error');
        console.error(err);
        throw err; // Re-throw to allow caller to handle UI state
    }
  }, [addToast]);

  useEffect(() => {
    // Automatically fetch history when user is authenticated
    if (isAuthenticated && driverName) {
      fetchHistory(true); // silent fetch on initial load
    }
  }, [isAuthenticated, driverName, fetchHistory]);


  return (
    <HistoryContext.Provider value={{ history, isLoading, error, fetchHistory, updateRecord }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};