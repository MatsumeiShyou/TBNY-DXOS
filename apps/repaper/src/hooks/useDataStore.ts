import { useRef } from 'react';
import { useToast } from './useToast';
import { useDataState } from './store/useDataState';
import { useDataLoader } from './store/useDataLoader';
import { useMasterActions } from './store/useMasterActions';
import { useDailyActions } from './store/useDailyActions';
import { useAutoSync } from './store/useAutoSync';
import { MasterItem, ExceptionData, MonthlyExceptions, SyncBaseline } from './store/types';

export function useDataStore(dateStr: string | null | undefined, isPreviewMode: boolean = false) {
  const { showToast } = useToast();

  const { state, setters, historyOps } = useDataState(isPreviewMode);
  // 自動同期の差分基準（ロード時に設定、同期のたびに更新）
  const baselineRef = useRef<SyncBaseline | null>(null);

  useDataLoader({
    dateStr,
    isPreviewMode,
    state,
    setters,
    historyOps,
    showToast,
    baselineRef
  });

  useAutoSync({ dateStr, isPreviewMode, state, baselineRef, showToast });

  const masterActions = useMasterActions({ dateStr, state, setters, historyOps });
  const dailyActions = useDailyActions({ dateStr, state, setters });

  return {
    ...state,
    
    // Master Actions
    saveCustomer: masterActions.saveCustomer,
    saveBulkCustomers: masterActions.saveBulkCustomers,
    deleteCustomer: masterActions.deleteCustomer,
    saveWorker: masterActions.saveWorker,
    deleteWorker: masterActions.deleteWorker,
    saveVehicle: masterActions.saveVehicle,
    deleteVehicle: masterActions.deleteVehicle,
    saveItems: masterActions.saveItems,
    deleteItem: masterActions.deleteItem,

    // Daily Actions
    addSpotJob: dailyActions.addSpotJob,
    deleteJobFromCalendar: dailyActions.deleteJobFromCalendar,
    moveSpotJob: dailyActions.moveSpotJob,
    
    // Setters
    setJobs: setters.setJobs,
    setPendingJobs: setters.setPendingJobs,
    setSplits: setters.setSplits,
    setDrivers: setters.setDrivers,
    setMonthlyExceptions: setters.setMonthlyExceptions,
    setMasterItems: setters.setMasterItems,

    // History Ops
    history: historyOps.history,
    recordHistory: historyOps.recordHistory,
    undo: historyOps.undo,
    redo: historyOps.redo,
    clearHistory: historyOps.clearHistory
  };
}

export type { MasterItem, ExceptionData, MonthlyExceptions };
