import { useState, useCallback } from 'react';
import { MasterWorker, MasterVehicle, Customer, Driver, Job, Split } from '../../types';
import { MasterItem, MonthlyExceptions } from './types';
import { useHistory } from '../useHistory';

export function useDataState(isPreviewMode: boolean) {
  // 1. 状態の定義 (Master Data)
  const [masterWorkers, setMasterWorkers] = useState<MasterWorker[]>([]);
  const [masterVehicles, setMasterVehicles] = useState<MasterVehicle[]>([]);
  const [masterCustomers, setMasterCustomers] = useState<Customer[]>([]);
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);

  // 2. 状態の定義 (Daily/Shift Data)
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [splits, setSplits] = useState<Split[]>([]);
  const [monthlyExceptions, setMonthlyExceptions] = useState<MonthlyExceptions>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // 履歴管理のフックを統合
  const { history, recordHistory: originalRecordHistory, undo, redo, clearHistory } = useHistory(
    { jobs, pendingJobs, splits, drivers, monthlyExceptions },
    { setJobs, setPendingJobs, setSplits, setDrivers, setMonthlyExceptions }
  );

  // プレビュー中は履歴記録を遮断
  const recordHistory = useCallback((actionMsg?: string) => {
    if (!isPreviewMode) {
      originalRecordHistory();
    }
  }, [isPreviewMode, originalRecordHistory]);

  return {
    state: {
      masterWorkers,
      masterVehicles,
      masterCustomers,
      masterItems,
      drivers,
      jobs,
      pendingJobs,
      splits,
      monthlyExceptions,
      isLoaded,
    },
    setters: {
      setMasterWorkers,
      setMasterVehicles,
      setMasterCustomers,
      setMasterItems,
      setDrivers,
      setJobs,
      setPendingJobs,
      setSplits,
      setMonthlyExceptions,
      setIsLoaded,
    },
    historyOps: {
      history,
      recordHistory,
      undo,
      redo,
      clearHistory
    }
  };
}
