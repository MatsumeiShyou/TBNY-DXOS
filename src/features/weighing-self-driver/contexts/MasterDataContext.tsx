/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useCallback } from 'react';
import { getMasterData as fetchMasterDataFromApi } from '../services/gasApi';
import { getMasterData, saveMasterData } from '../services/db';
import type { Location, Item } from '../types';

interface MasterDataContextType {
  locations: Location[];
  items: Item[];
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  fetchMasterData: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMasterData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Try to load from IndexedDB cache
      const cachedData = await getMasterData();
      const oneHour = 60 * 60 * 1000;
      if (cachedData && (new Date().getTime() - cachedData.timestamp.getTime() < oneHour)) {
        setLocations(cachedData.locations);
        setItems(cachedData.items);
        setLastUpdated(cachedData.timestamp);
        setIsLoading(false);
        return;
      }

      // 2. If cache is old or doesn't exist, fetch from API
      const apiData = await fetchMasterDataFromApi();
      const now = new Date();
      setLocations(apiData.locations);
      setItems(apiData.items);
      setLastUpdated(now);

      // 3. Save fresh data to IndexedDB
      await saveMasterData(apiData, now);

    } catch (err) {
      setError('マスターデータの取得に失敗しました。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <MasterDataContext.Provider value={{ locations, items, isLoading, lastUpdated, error, fetchMasterData }}>
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (context === undefined) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
};
