import { useState, useCallback, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { generateDailySchedule } from '../utils/calendarUtils';
import { INITIAL_DRIVERS, CUSTOMERS, INITIAL_WORKERS, INITIAL_VEHICLES, INITIAL_ITEMS } from '../data/constants';
import { useHistory } from './useHistory';
import { MasterWorker, MasterVehicle, Customer, Driver, Job, Split } from '../types';

export interface MasterItem {
  id: string;
  name: string;
  [key: string]: any;
}

export interface ExceptionData {
  spotJobs: Job[];
  cancellations: string[];
  reschedules: Job[];
}

export type MonthlyExceptions = Record<string, ExceptionData>;

// 重複排除（自己修復）用のヘルパー関数
function uniqueJobs(jobsArray: Job[] | undefined): Job[] {
  const seenIds = new Set<string>();
  const seenGenCustomers = new Set<string>();
  
  return (jobsArray || []).filter(j => {
    if (seenIds.has(j.id)) return false;
    
    // 定期ジョブ(gen_)は同一日に同一顧客で1件のみに強制し、増殖バグを防ぐ
    if (j.id.startsWith('gen_')) {
      if (seenGenCustomers.has(j.originalCustomerId)) return false;
      seenGenCustomers.add(j.originalCustomerId);
    }
    
    seenIds.add(j.id);
    return true;
  });
}

export function useDataStore(dateStr: string | null | undefined, isPreviewMode: boolean = false) {
  // ==========================================
  // 1. 状態の定義 (Master Data)
  // ==========================================
  const [masterWorkers, setMasterWorkers] = useState<MasterWorker[]>([]);
  const [masterVehicles, setMasterVehicles] = useState<MasterVehicle[]>([]);
  const [masterCustomers, setMasterCustomers] = useState<Customer[]>([]);
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);

  // ==========================================
  // 2. 状態の定義 (Daily/Shift Data)
  // ==========================================
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

  // 状態が更新されたらストレージに自動保存する（非同期化への過渡期用）
  const saveMasterTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isLoaded) return;
    if (saveMasterTimeout.current) clearTimeout(saveMasterTimeout.current);
    saveMasterTimeout.current = setTimeout(() => {
      storageService.saveMasterData({
        workers: masterWorkers,
        vehicles: masterVehicles,
        customers: masterCustomers,
        items: masterItems
      });
    }, 500);
  }, [masterWorkers, masterVehicles, masterCustomers, masterItems, isLoaded]);

  const saveDailyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isLoaded || !dateStr || isPreviewMode) return; // プレビュー中は自動保存を完全にブロック
    if (saveDailyTimeout.current) clearTimeout(saveDailyTimeout.current);
    saveDailyTimeout.current = setTimeout(() => {
      storageService.saveDailyState(dateStr, { drivers, jobs, pendingJobs, splits });
      storageService.saveState({ drivers, jobs, pendingJobs, splits }); 
      storageService.saveExceptions(monthlyExceptions);
    }, 500);
  }, [drivers, jobs, pendingJobs, splits, monthlyExceptions, dateStr, isLoaded, isPreviewMode]);

  // ==========================================
  // 3. データの初期ロードとカスケード処理
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      // 1. マスタデータのロード
      const master = await storageService.loadMasterData(INITIAL_WORKERS, INITIAL_VEHICLES, CUSTOMERS, INITIAL_ITEMS);
      setMasterWorkers(master.workers);
      setMasterVehicles(master.vehicles);
      setMasterCustomers(master.customers);
      setMasterItems(master.items);

      // 2. 日次データのロードと孤児データの判定
      if (dateStr) {
        const dailyState = await storageService.loadDailyState(dateStr);
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
              return {
                ...j,
                title: `⚠️削除済 ${cleanTitle}`,
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
                title: `⚠️停止中 ${customer.name}`,
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

          // 絶対的マスタ登録の原則: 孤児データをサイレントキルせず、エラーとして可視化する
          const filteredJobs = (dailyState.jobs || []).map(refreshJob);
          const filteredPending = (dailyState.pendingJobs || []).map(refreshJob);

          // 既存ジョブのIDセット
          const existingJobIds = new Set([
            ...filteredJobs.map((j: any) => j.id),
            ...filteredPending.map((j: any) => j.id)
          ]);

          // 例外データから、まだ配車盤に存在しないジョブを抽出
          const newSpotAndReschedules = [
            ...(dailyExceptions.spotJobs || []),
            ...(dailyExceptions.reschedules || [])
          ].filter((j: any) => !existingJobIds.has(j.id)).map(refreshJob);

          // キャンセル（休止）された定期ジョブを配車盤から削除
          const cancellations = new Set(dailyExceptions.cancellations || []);
          const finalJobs = uniqueJobs(filteredJobs.filter((j: any) => !(cancellations.has(j.originalCustomerId) && j.id.startsWith('gen_'))));
          const expectedJobs = generateDailySchedule(dateStr, master.customers, dailyExceptions.cancellations || [], dailyExceptions.spotJobs || []);
          const expectedCustomerIds = new Set(expectedJobs.map((j: any) => j.originalCustomerId));

          // 未配車リストのノイズ除去（スケジュール外案件や、孤児データは残す）
          const finalPending = uniqueJobs([
            ...filteredPending.filter((j: any) => {
              if (j.isOrphan) return true; // 孤児データは削除できるように残す
              if (cancellations.has(j.originalCustomerId) && j.id.startsWith('gen_')) return false;
              if (j.id.startsWith('gen_') && !expectedCustomerIds.has(j.originalCustomerId)) {
                return false;
              }
              return true;
            }),
            ...newSpotAndReschedules
          ]);

          // --- 新規スケジュールの補完追加 ---
          const jobsGenCustomerIds = new Set(
            finalJobs.filter((j: any) => j.id.startsWith('gen_')).map((j: any) => j.originalCustomerId)
          );
          
          // 配車盤にすでに存在する定期案件は、未配車リストから強制的に削除（増殖・重複防止）
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

          setDrivers(dailyState.drivers || (INITIAL_DRIVERS as any));
          setJobs(finalJobs);
          setPendingJobs(finalPendingWithMissing);
          setSplits(dailyState.splits || []);
        } else {
          // 保存データがない日付の初期生成
          const newDailyJobs = generateDailySchedule(dateStr, master.customers, dailyExceptions.cancellations || [], dailyExceptions.spotJobs || []);
          
          const spotAndReschedules = [
            ...(dailyExceptions.spotJobs || []),
            ...(dailyExceptions.reschedules || [])
          ];

          setDrivers(INITIAL_DRIVERS as any);
          setJobs([]);
          setPendingJobs(uniqueJobs([...newDailyJobs, ...spotAndReschedules]));
          setSplits([]);
        }
      }
      
      const exceptionsData = storageService.loadExceptions() || {};
      
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
      setMonthlyExceptions(filteredExceptions);

      setIsLoaded(true);
      if (clearHistory) clearHistory();
    };

    loadData();
  }, [dateStr, clearHistory]);

  // ==========================================
  // 4. 非同期アクション群 (API / Supabase対応前提)
  // ==========================================

  const saveCustomer = async (customerData: Customer & { isInvalid?: boolean; kana?: string; preferredTime?: string; items?: any[]; note?: string; holidayCollection?: boolean }) => {
    setMasterCustomers(prev => {
      const exists = prev.find(c => c.id === customerData.id);
      if (exists) {
        return prev.map(c => c.id === customerData.id ? customerData : c);
      }
      return [...prev, customerData];
    });

    const updateJobAttributes = (job: Job | any): Job => {
      if (job.originalCustomerId !== customerData.id) return job;
      return {
        ...job,
        title: customerData.name || job.title,
        kana: customerData.kana !== undefined ? customerData.kana : job.kana,
        area: customerData.area !== undefined ? customerData.area : job.area,
        duration: Number(customerData.defaultDuration) || job.duration || 30,
        preferredTime: customerData.preferredTime !== undefined ? customerData.preferredTime : job.preferredTime,
        requiredVehicle: customerData.requiredVehicle !== undefined ? customerData.requiredVehicle : job.requiredVehicle,
        items: customerData.items || job.items || [],
        note: customerData.note !== undefined ? customerData.note : job.note,
        holidayCollection: customerData.holidayCollection !== undefined ? customerData.holidayCollection : job.holidayCollection
      };
    };

    if (customerData.isInvalid) {
      setJobs(prev => prev.filter(j => j.originalCustomerId !== customerData.id));
      setPendingJobs(prev => prev.filter(j => j.originalCustomerId !== customerData.id));
      setMonthlyExceptions(prev => {
        const updated: MonthlyExceptions = {};
        for (const [d, exp] of Object.entries(prev)) {
          updated[d] = {
            spotJobs: (exp.spotJobs || []).filter(j => j.originalCustomerId !== customerData.id),
            cancellations: (exp.cancellations || []).filter(id => id !== customerData.id),
            reschedules: (exp.reschedules || []).filter(j => j.originalCustomerId !== customerData.id)
          };
        }
        return updated;
      });
    } else {
      setJobs(prev => prev.map(updateJobAttributes));
      
      if (dateStr) {
        const dailyJobsForToday = generateDailySchedule(dateStr, [customerData], [], (storageService.loadExceptions()?.[dateStr]?.spotJobs || []));
        const shouldBeInScheduleToday = dailyJobsForToday.length > 0;

        setPendingJobs(prev => {
          const isCurrentlyInPending = prev.some(j => j.originalCustomerId === customerData.id);
          
          if (shouldBeInScheduleToday) {
            if (isCurrentlyInPending) {
              return prev.map(updateJobAttributes);
            } else {
              return uniqueJobs([...prev, ...dailyJobsForToday]);
            }
          } else {
            return prev.filter(j => j.originalCustomerId !== customerData.id || !j.id.startsWith('gen_'));
          }
        });
      } else {
        setPendingJobs(prev => prev.map(updateJobAttributes));
      }

      setMonthlyExceptions(prev => {
        const updated: MonthlyExceptions = {};
        for (const [d, exp] of Object.entries(prev)) {
          updated[d] = {
            ...exp,
            spotJobs: (exp.spotJobs || []).map(updateJobAttributes),
            reschedules: (exp.reschedules || []).map(updateJobAttributes)
          };
        }
        return updated;
      });
    }
  };

  const saveBulkCustomers = async (updatedCustomers: any[]) => {
    setMasterCustomers(updatedCustomers);
    
    const customerMap = new Map(updatedCustomers.map(c => [c.id, c]));
    const syncJob = (job: any) => {
      const c = customerMap.get(job.originalCustomerId);
      if (!c) return job;
      
      let newTitle = c.name || job.title;
      let isDeleted = false;
      let isSuspended = false;
      
      if (c.isDeleted) {
        newTitle = `⚠️削除済 ${String(newTitle).replace(/^⚠️(削除済|停止中)\s*/, '')}`;
        isDeleted = true;
      } else if (c.isInvalid) {
        newTitle = `⚠️停止中 ${String(newTitle).replace(/^⚠️(削除済|停止中)\s*/, '')}`;
        isSuspended = true;
      } else {
        newTitle = String(newTitle).replace(/^⚠️(削除済|停止中)\s*/, '');
      }

      return {
        ...job,
        title: newTitle,
        kana: c.kana !== undefined ? c.kana : job.kana,
        area: c.area !== undefined ? c.area : job.area,
        duration: Number(c.defaultDuration) || job.duration || 30,
        preferredTime: c.preferredTime !== undefined ? c.preferredTime : job.preferredTime,
        requiredVehicle: c.requiredVehicle !== undefined ? c.requiredVehicle : job.requiredVehicle,
        items: c.items || job.items || [],
        note: c.note !== undefined ? c.note : job.note,
        holidayCollection: c.holidayCollection !== undefined ? c.holidayCollection : job.holidayCollection,
        isDeleted,
        isSuspended
      };
    };

    setJobs(prev => prev.map(syncJob));
    
    if (dateStr) {
      setPendingJobs(prev => {
        let newPending = prev.map(syncJob);
        
        for (const customer of updatedCustomers) {
          if (customer.isInvalid) continue;

          const dailyJobsForToday = generateDailySchedule(dateStr, [customer], [], (storageService.loadExceptions()?.[dateStr]?.spotJobs || []));
          const shouldBeInScheduleToday = dailyJobsForToday.length > 0;
          const isCurrentlyInPending = newPending.some(j => j.originalCustomerId === customer.id);
          
          if (shouldBeInScheduleToday) {
            if (!isCurrentlyInPending) {
              newPending = uniqueJobs([...newPending, ...dailyJobsForToday]);
            }
          } else {
            newPending = newPending.filter(j => j.originalCustomerId !== customer.id || !j.id.startsWith('gen_'));
          }
        }
        return newPending;
      });
    } else {
      setPendingJobs(prev => prev.filter(j => validIds.has(j.originalCustomerId || '')).map(syncJob));
    }

    setMonthlyExceptions(prev => {
      const updated: MonthlyExceptions = {};
      for (const [d, exp] of Object.entries(prev)) {
        updated[d] = {
          spotJobs: (exp.spotJobs || []).filter(j => validIds.has(j.originalCustomerId || '')).map(syncJob),
          cancellations: (exp.cancellations || []).filter(id => validIds.has(id)),
          reschedules: (exp.reschedules || []).filter(j => validIds.has(j.originalCustomerId || '')).map(syncJob)
        };
      }
      return updated;
    });
  };

  const deleteCustomer = async (id: string) => {
    setMasterCustomers(prev => prev.map(c => c.id === id ? { ...c, isDeleted: true } : c));
    if (clearHistory) clearHistory();
  };

  const saveWorker = async (workerData: MasterWorker, isEdit: boolean) => {
    setMasterWorkers(prev => {
      if (isEdit) return prev.map(w => w.id === workerData.id ? workerData : w);
      return [...prev, workerData];
    });
  };

  const deleteWorker = async (id: string) => {
    setMasterWorkers(prev => prev.filter(w => w.id !== id));
  };

  const saveVehicle = async (vehicleData: MasterVehicle, isEdit: boolean) => {
    setMasterVehicles(prev => {
      if (isEdit) return prev.map(v => v.id === vehicleData.id ? vehicleData : v);
      return [...prev, vehicleData];
    });
  };

  const deleteVehicle = async (id: string) => {
    setMasterVehicles(prev => prev.filter(v => v.id !== id));
  };

  const saveItems = async (newItems: MasterItem[]) => {
    setMasterItems(newItems);
  };

  const deleteItem = async (id: string) => {
    setMasterItems(prev => prev.filter(i => i.id !== id));
  };

  const saveJobs = async (newJobs: Job[]) => {
    setJobs(newJobs);
  };
  
  const savePendingJobs = async (newPendingJobs: Job[]) => {
    setPendingJobs(newPendingJobs);
  };

  const saveSplits = async (newSplits: Split[]) => {
    setSplits(newSplits);
  };

  const saveDrivers = async (newDrivers: Driver[]) => {
    setDrivers(newDrivers);
  };

  const addSpotJob = async (targetDates: string | string[], spotJob: any) => {
    const dates = Array.isArray(targetDates) ? targetDates : [targetDates];

    setMonthlyExceptions(prev => {
      const next = { ...prev };
      dates.forEach(d => {
        const exp = next[d] || { spotJobs: [], cancellations: [], reschedules: [] };
        const newJob = dates.length > 1 ? { ...spotJob, id: `${spotJob.id}_${d}` } : spotJob;
        next[d] = {
          ...exp,
          spotJobs: [...exp.spotJobs, newJob]
        };
      });
      return next;
    });

    dates.forEach(d => {
      const newJob = dates.length > 1 ? { ...spotJob, id: `${spotJob.id}_${d}` } : spotJob;
      const dailyState = storageService.loadDailyStateSync(d);
      if (dailyState) {
        dailyState.pendingJobs = uniqueJobs([...(dailyState.pendingJobs || []), newJob]);
        storageService.saveDailyState(d, dailyState);
      }
      
      if (dateStr === d) {
        setPendingJobs(prev => uniqueJobs([...prev, newJob]));
      }
    });
  };

  const deleteJobFromCalendar = async (targetDateStr: string, jobId: string, scope = 'this', seriesId = null) => {
    if (scope === 'this' || !seriesId) {
      setMonthlyExceptions(prev => {
        const exp = prev[targetDateStr] || { spotJobs: [], cancellations: [], reschedules: [] };
        return {
          ...prev,
          [targetDateStr]: {
            ...exp,
            spotJobs: exp.spotJobs.filter(j => j.id !== jobId)
          }
        };
      });

      const dailyState = storageService.loadDailyStateSync(targetDateStr);
      if (dailyState) {
        dailyState.jobs = (dailyState.jobs || []).filter((j: any) => j.id !== jobId);
        dailyState.pendingJobs = (dailyState.pendingJobs || []).filter((j: any) => j.id !== jobId);
        storageService.saveDailyState(targetDateStr, dailyState);
      }

      if (dateStr === targetDateStr) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        setPendingJobs(prev => prev.filter(j => j.id !== jobId));
      }
    } else {
      const isFuture = scope === 'future';
      
      setMonthlyExceptions(prev => {
        const next: MonthlyExceptions = { ...prev };
        Object.keys(next).forEach(d => {
          if (isFuture && d < targetDateStr) return;
          const exp = next[d];
          if (exp && exp.spotJobs) {
            next[d] = {
              ...exp,
              spotJobs: exp.spotJobs.filter((j: any) => j.seriesId !== seriesId)
            };
          }
        });
        return next;
      });

      const allExceptions = storageService.loadExceptions() || {};
      Object.keys(allExceptions).forEach(d => {
        if (isFuture && d < targetDateStr) return;
        
        const dailyState = storageService.loadDailyStateSync(d);
        if (dailyState) {
          const hasTarget = (dailyState.jobs || []).some((j: any) => j.seriesId === seriesId) || 
                            (dailyState.pendingJobs || []).some((j: any) => j.seriesId === seriesId);
          if (hasTarget) {
            dailyState.jobs = (dailyState.jobs || []).filter((j: any) => j.seriesId !== seriesId);
            dailyState.pendingJobs = (dailyState.pendingJobs || []).filter((j: any) => j.seriesId !== seriesId);
            storageService.saveDailyState(d, dailyState);
          }
        }
      });

      if (!isFuture || (dateStr && dateStr >= targetDateStr)) {
        setJobs(prev => prev.filter((j: any) => j.seriesId !== seriesId));
        setPendingJobs(prev => prev.filter((j: any) => j.seriesId !== seriesId));
      }
    }
  };

  const moveSpotJob = async (sourceDateStr: string, targetDateStr: string, jobId: string) => {
    if (sourceDateStr === targetDateStr) return;

    let jobToMove: any = null;
    
    setMonthlyExceptions(prev => {
      const sourceExp = prev[sourceDateStr] || { spotJobs: [], cancellations: [], reschedules: [] };
      jobToMove = sourceExp.spotJobs.find((j: any) => j.id === jobId);
      if (!jobToMove) return prev;
      
      const targetExp = prev[targetDateStr] || { spotJobs: [], cancellations: [], reschedules: [] };
      return {
        ...prev,
        [sourceDateStr]: {
          ...sourceExp,
          spotJobs: sourceExp.spotJobs.filter((j: any) => j.id !== jobId)
        },
        [targetDateStr]: {
          ...targetExp,
          spotJobs: [...targetExp.spotJobs, jobToMove]
        }
      };
    });

    const currentExp = monthlyExceptions[sourceDateStr] || { spotJobs: [] };
    jobToMove = jobToMove || currentExp.spotJobs.find((j: any) => j.id === jobId);
    if (!jobToMove) return;

    const sourceDaily = storageService.loadDailyStateSync(sourceDateStr);
    if (sourceDaily) {
      const jobInJobs = (sourceDaily.jobs || []).find((j: any) => j.id === jobId);
      const jobInPending = (sourceDaily.pendingJobs || []).find((j: any) => j.id === jobId);
      const actualJobState = jobInJobs || jobInPending || jobToMove;
      
      jobToMove = { ...actualJobState, driverId: undefined, startTime: undefined };

      sourceDaily.jobs = (sourceDaily.jobs || []).filter((j: any) => j.id !== jobId);
      sourceDaily.pendingJobs = (sourceDaily.pendingJobs || []).filter((j: any) => j.id !== jobId);
      storageService.saveDailyState(sourceDateStr, sourceDaily);
    } else {
      jobToMove = { ...jobToMove, driverId: undefined, startTime: undefined };
    }

    const targetDaily = storageService.loadDailyStateSync(targetDateStr);
    if (targetDaily) {
      targetDaily.pendingJobs = uniqueJobs([...(targetDaily.pendingJobs || []), jobToMove]);
      storageService.saveDailyState(targetDateStr, targetDaily);
    }

    if (dateStr === sourceDateStr) {
      setJobs(prev => prev.filter((j: any) => j.id !== jobId));
      setPendingJobs(prev => prev.filter((j: any) => j.id !== jobId));
    }
    if (dateStr === targetDateStr) {
      setPendingJobs(prev => uniqueJobs([...prev, jobToMove]));
    }
  };

  return {
    isLoaded,
    masterWorkers,
    masterVehicles,
    masterCustomers,
    masterItems,
    drivers,
    jobs,
    pendingJobs,
    splits,
    monthlyExceptions,

    saveCustomer,
    saveBulkCustomers,
    deleteCustomer,
    saveWorker,
    deleteWorker,
    saveVehicle,
    deleteVehicle,
    saveItems,
    deleteItem,
    
    addSpotJob,
    deleteJobFromCalendar,
    moveSpotJob,

    setJobs,
    setPendingJobs,
    setSplits,
    setDrivers,
    setMonthlyExceptions,
    setMasterItems,

    history,
    recordHistory,
    undo,
    redo,
    clearHistory
  };
}
