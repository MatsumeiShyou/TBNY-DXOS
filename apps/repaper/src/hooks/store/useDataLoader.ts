import { useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { generateDailySchedule } from '../../utils/calendarUtils';
import { INITIAL_DRIVERS } from '../../data/constants';
import { Customer } from '../../types';
import { uniqueJobs } from './utils';
import { ExceptionData, MonthlyExceptions, SyncBaseline } from './types';

export function useDataLoader({
  dateStr,
  isPreviewMode,
  state,
  setters,
  historyOps,
  showToast,
  baselineRef
}: any) {
  const {
    masterWorkers,
    masterVehicles,
    masterCustomers,
    masterItems,
    monthlyExceptions,
    isLoaded
  } = state;

  const {
    setMasterWorkers,
    setMasterVehicles,
    setMasterCustomers,
    setMasterItems,
    setDrivers,
    setJobs,
    setPendingJobs,
    setSplits,
    setMonthlyExceptions,
    setIsLoaded
  } = setters;

  const { clearHistory } = historyOps;

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        // 1. マスタデータのロード
        const master = await storageService.loadMasterData();
        if (!isActive) return;

        let daily: { drivers: any[]; jobs: any[]; pendingJobs: any[]; splits: any[] } | null = null;

        // 2. 日次データのロードと孤児データの判定
        if (dateStr) {
          const dailyState = await storageService.loadDailyState(dateStr);
          if (!isActive) return;
          const exceptionsData = await storageService.loadExceptions() || {};
          const dailyExceptions = exceptionsData[dateStr] || { spotJobs: [], cancellations: [], reschedules: [] };

          if (dailyState) {
            const customerMap = new Map(master.customers.map((c: Customer) => [c.id, c]));
          
          // ジョブをマスタの最新情報で同期（リフレッシュ）し、孤児データを判定
          const refreshJob = (j: any) => {
            if (j.startTime && typeof j.startTime === 'string') {
              j.startTime = j.startTime.replace(/^0/, '');
            }
            const customer = customerMap.get(j.originalCustomerId);
            if (!customer || customer.isDeleted) {
              const cleanTitle = String(j.title || '').replace(/^⚠️(削除済|停止中)\s*/, '');
              const displayName = customer ? customer.name : cleanTitle;
              return {
                ...j,
                title: displayName,
                kana: '',
                isDeleted: true,
                isSuspended: false,
                isOrphan: false,
                isError: false,
                duration: j.duration || 30
              };
            }
            if (customer.isInvalid) {
              return {
                ...j,
                title: customer.name,
                kana: customer.kana || '',
                isDeleted: false,
                isSuspended: true,
                isOrphan: false,
                isError: false,
                duration: customer.defaultDuration || j.duration || 30
              };
            }
            return {
              ...j,
              title: customer.name,
              kana: customer.kana || '',
              isDeleted: false,
              isSuspended: false,
              isOrphan: false,
              isError: false,
              duration: customer.defaultDuration || j.duration || 30
            };
          };

          const filteredJobs = (dailyState.jobs || []).filter((j: any) => customerMap.has(j.originalCustomerId)).map(refreshJob);
          const filteredPending = (dailyState.pendingJobs || []).filter((j: any) => customerMap.has(j.originalCustomerId)).map(refreshJob);

          const existingJobIds = new Set([
            ...filteredJobs.map((j: any) => j.id),
            ...filteredPending.map((j: any) => j.id)
          ]);

          const newSpotAndReschedules = [
            ...(dailyExceptions.spotJobs || []),
            ...(dailyExceptions.reschedules || [])
          ].filter((j: any) => !existingJobIds.has(j.id)).map(refreshJob);

          const cancellations = new Set(dailyExceptions.cancellations || []);
          const finalJobs = uniqueJobs(filteredJobs.filter((j: any) => !(cancellations.has(j.originalCustomerId) && j.id.startsWith('gen_'))));
          const expectedJobs = generateDailySchedule(dateStr, master.customers, dailyExceptions.cancellations || [], dailyExceptions.spotJobs || []);
          const expectedCustomerIds = new Set(expectedJobs.map((j: any) => j.originalCustomerId));

          const finalPending = uniqueJobs([
            ...filteredPending.filter((j: any) => {
              if (j.isOrphan) return true;
              if (cancellations.has(j.originalCustomerId) && j.id.startsWith('gen_')) return false;
              if (j.id.startsWith('gen_') && !expectedCustomerIds.has(j.originalCustomerId)) {
                return false;
              }
              return true;
            }),
            ...newSpotAndReschedules
          ]);

          const jobsGenCustomerIds = new Set(
            finalJobs.filter((j: any) => j.id.startsWith('gen_')).map((j: any) => j.originalCustomerId)
          );
          
          const deduplicatedPending = finalPending.filter((j: any) => {
            if (j.id.startsWith('gen_') && jobsGenCustomerIds.has(j.originalCustomerId)) {
              return false;
            }
            return true;
          });

          const existingGenCustomerIds = new Set([
            ...jobsGenCustomerIds,
            ...deduplicatedPending.filter((j: any) => j.id.startsWith('gen_')).map((j: any) => j.originalCustomerId)
          ]);
          
          const missingGeneratedJobs = expectedJobs.filter((j: any) => !existingGenCustomerIds.has(j.originalCustomerId));
          
          const finalPendingWithMissing = uniqueJobs([
            ...deduplicatedPending,
            ...missingGeneratedJobs
          ]);

          const loadedDrivers = dailyState.drivers || (INITIAL_DRIVERS as any);
          // 存在しない列に紐づいたジョブは盤面に表示できないため、未配車へ退避する
          const columnIds = new Set(loadedDrivers.map((d: any) => d.id));
          const orphanedJobs = finalJobs.filter((j: any) => !columnIds.has(j.driverId));
          daily = {
            drivers: loadedDrivers,
            jobs: finalJobs.filter((j: any) => columnIds.has(j.driverId)),
            pendingJobs: uniqueJobs([...finalPendingWithMissing, ...orphanedJobs.map((j: any) => ({ ...j, driverId: undefined }))]),
            splits: dailyState.splits || []
          };
        } else {
          const newDailyJobs = generateDailySchedule(dateStr, master.customers, dailyExceptions.cancellations || [], dailyExceptions.spotJobs || []);
          
          const spotAndReschedules = [
            ...(dailyExceptions.spotJobs || []),
            ...(dailyExceptions.reschedules || [])
          ];

          daily = {
            drivers: INITIAL_DRIVERS as any,
            jobs: [],
            pendingJobs: uniqueJobs([...newDailyJobs, ...spotAndReschedules]),
            splits: []
          };
        }
      }
      
      const exceptionsData = await storageService.loadExceptions() || {};
      
      const validCustomerIds = new Set(master.customers.map((c: Customer) => c.id));
      const filteredExceptions: MonthlyExceptions = {};
      for (const [date, exp] of Object.entries(exceptionsData)) {
        const e = exp as ExceptionData;
        filteredExceptions[date] = {
          spotJobs: (e.spotJobs || []).filter(j => validCustomerIds.has(j.originalCustomerId || '')),
          cancellations: (e.cancellations || []).filter(id => validCustomerIds.has(id)),
          reschedules: (e.reschedules || []).filter(j => validCustomerIds.has(j.originalCustomerId || ''))
        };
      }
      if (!isActive) return;

      // 全状態を一括で反映し、同時に自動同期の差分基準を記録する
      // （途中状態が差分として同期キューに積まれるのを防ぐ）
      setMasterWorkers(master.workers);
      setMasterVehicles(master.vehicles);
      setMasterCustomers(master.customers);
      setMasterItems(master.items);
      if (daily) {
        setDrivers(daily.drivers);
        setJobs(daily.jobs);
        setPendingJobs(daily.pendingJobs);
        setSplits(daily.splits);
      }
      setMonthlyExceptions(filteredExceptions);

      const baseline: SyncBaseline = {
        dateStr,
        jobs: daily?.jobs || [],
        pendingJobs: daily?.pendingJobs || [],
        drivers: daily?.drivers || [],
        splits: daily?.splits || [],
        monthlyExceptions: filteredExceptions,
        master: { workers: master.workers, vehicles: master.vehicles, customers: master.customers, items: master.items }
      };
      baselineRef.current = baseline;

      setIsLoaded(true);
      if (clearHistory) clearHistory();
      } catch (err: any) {
        if (isActive) {
          console.error("Failed to load initial data:", err);
          showToast('データの読み込みに失敗しました: ' + (err?.message || '不明なエラー'), 'error');
          // 基準を無効化し、読み込めていない状態での自動同期（上書き）を防ぐ
          baselineRef.current = null;
          setIsLoaded(true);
        }
      }
    };

    loadData();
    return () => {
      isActive = false;
    };
  }, [dateStr, clearHistory]); // getters to be safe but typically stable
}
