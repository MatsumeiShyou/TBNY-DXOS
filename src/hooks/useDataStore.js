import { useState, useCallback, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { generateDailySchedule } from '../utils/calendarUtils';
import { INITIAL_DRIVERS, CUSTOMERS, INITIAL_WORKERS, INITIAL_VEHICLES, INITIAL_ITEMS } from '../data/constants';
import { useHistory } from './useHistory';

// 重複排除（自己修復）用のヘルパー関数
function uniqueJobs(jobsArray) {
  const seen = new Set();
  return (jobsArray || []).filter(j => {
    if (seen.has(j.id)) return false;
    seen.add(j.id);
    return true;
  });
}

export function useDataStore(dateStr, isPreviewMode = false) {
  // ==========================================
  // 1. 状態の定義 (Master Data)
  // ==========================================
  const [masterWorkers, setMasterWorkers] = useState([]);
  const [masterVehicles, setMasterVehicles] = useState([]);
  const [masterCustomers, setMasterCustomers] = useState([]);
  const [masterItems, setMasterItems] = useState([]);

  // ==========================================
  // 2. 状態の定義 (Daily/Shift Data)
  // ==========================================
  const [drivers, setDrivers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [splits, setSplits] = useState([]);
  const [monthlyExceptions, setMonthlyExceptions] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // 履歴管理のフックを統合
  const { history, recordHistory: originalRecordHistory, undo, redo, clearHistory } = useHistory(
    { jobs, pendingJobs, splits, drivers, monthlyExceptions },
    { setJobs, setPendingJobs, setSplits, setDrivers, setMonthlyExceptions }
  );

  // プレビュー中は履歴記録を遮断
  const recordHistory = useCallback((actionMsg) => {
    if (!isPreviewMode) {
      originalRecordHistory(actionMsg);
    }
  }, [isPreviewMode, originalRecordHistory]);

  // 状態が更新されたらストレージに自動保存する（非同期化への過渡期用）
  const saveMasterTimeout = useRef(null);
  useEffect(() => {
    if (!isLoaded) return;
    clearTimeout(saveMasterTimeout.current);
    saveMasterTimeout.current = setTimeout(() => {
      storageService.saveMasterData({
        workers: masterWorkers,
        vehicles: masterVehicles,
        customers: masterCustomers,
        items: masterItems
      });
    }, 500);
  }, [masterWorkers, masterVehicles, masterCustomers, masterItems, isLoaded]);

  const saveDailyTimeout = useRef(null);
  useEffect(() => {
    if (!isLoaded || !dateStr || isPreviewMode) return; // プレビュー中は自動保存を完全にブロック
    clearTimeout(saveDailyTimeout.current);
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

      // 2. 日次データのロードと孤児データの排除 (カスケード削除)
      if (dateStr) {
        const dailyState = await storageService.loadDailyState(dateStr);
        const exceptionsData = await storageService.loadExceptions() || {};
        const dailyExceptions = exceptionsData[dateStr] || { spotJobs: [], cancellations: [], reschedules: [] };

        if (dailyState) {
          const validCustomerIds = new Set(master.customers.map(c => c.id));
          
          // 絶対的マスタ登録の原則: マスタに存在しないジョブをフィルター
          const filteredJobs = (dailyState.jobs || []).filter(j => validCustomerIds.has(j.originalCustomerId));
          const filteredPending = (dailyState.pendingJobs || []).filter(j => validCustomerIds.has(j.originalCustomerId));

          // 既存ジョブのIDセット
          const existingJobIds = new Set([
            ...filteredJobs.map(j => j.id),
            ...filteredPending.map(j => j.id)
          ]);

          // 例外データから、まだ配車盤に存在しないジョブを抽出
          const newSpotAndReschedules = [
            ...(dailyExceptions.spotJobs || []),
            ...(dailyExceptions.reschedules || [])
          ].filter(j => !existingJobIds.has(j.id) && validCustomerIds.has(j.originalCustomerId));

          // キャンセル（休止）された定期ジョブを配車盤から削除
          const cancellations = new Set(dailyExceptions.cancellations || []);
          // キャンセル対象の定期ジョブ（jobType !== 'spot' 等で判定できるが、ここではIDの一致を見る）
          // 厳密にはオリジナルIDがキャンセルリストにあり、かつそれが生成された定期ジョブである場合削除すべきだが、
          // スポットジョブもオリジナルIDを持つため、安易に消すとスポットも消えてしまう。
          // `generateDailySchedule` で作られたジョブIDは `gen_` で始まるため、それだけを削除する。
          const finalJobs = uniqueJobs(filteredJobs.filter(j => !(cancellations.has(j.originalCustomerId) && j.id.startsWith('gen_'))));
          // 最新マスタから今日のスケジュールに基づくジョブ（本来あるべきジョブ）を生成
          const expectedJobs = generateDailySchedule(dateStr, master.customers, dailyExceptions.cancellations || []);
          const expectedCustomerIds = new Set(expectedJobs.map(j => j.originalCustomerId));

          // 未配車リストのノイズ除去（スケジュール外案件の自動削除）
          const finalPending = uniqueJobs([
            ...filteredPending.filter(j => {
              // 1. 日次でキャンセル（休止）された自動生成ジョブは除外
              if (cancellations.has(j.originalCustomerId) && j.id.startsWith('gen_')) return false;
              
              // 2. 自動生成ジョブ(gen_)のうち、最新のスケジュール条件から外れたものは除外
              if (j.id.startsWith('gen_') && !expectedCustomerIds.has(j.originalCustomerId)) {
                return false;
              }
              
              return true;
            }),
            ...newSpotAndReschedules
          ]);

          // --- 新規スケジュールの補完追加 ---
          // すでに配車盤や未配車リストに存在する「自動生成ジョブ(gen_)」の元顧客IDを収集
          const existingGenCustomerIds = new Set([
            ...finalJobs.filter(j => j.id.startsWith('gen_')).map(j => j.originalCustomerId),
            ...finalPending.filter(j => j.id.startsWith('gen_')).map(j => j.originalCustomerId)
          ]);
          
          // まだ dailyState に生成されていない（マスタで新規追加された）顧客のジョブだけを抽出
          const missingGeneratedJobs = expectedJobs.filter(j => !existingGenCustomerIds.has(j.originalCustomerId));
          
          // 不足しているジョブを既存の未配車リストに追加
          const finalPendingWithMissing = uniqueJobs([
            ...finalPending,
            ...missingGeneratedJobs
          ]);
          // ------------------------------

          setDrivers(dailyState.drivers || INITIAL_DRIVERS);
          setJobs(finalJobs);
          setPendingJobs(finalPendingWithMissing);
          setSplits(dailyState.splits || []);
        } else {
          // 保存データがない日付の初期生成
          // cancellations に含まれている場合は自動生成をスキップするよう calendarUtils 側で対応する前提
          const newDailyJobs = generateDailySchedule(dateStr, master.customers, dailyExceptions.cancellations || []);
          
          // spotJobs と reschedules も pendingJobs にマージする
          const spotAndReschedules = [
            ...(dailyExceptions.spotJobs || []),
            ...(dailyExceptions.reschedules || [])
          ];

          setDrivers(INITIAL_DRIVERS);
          setJobs([]);
          setPendingJobs(uniqueJobs([...newDailyJobs, ...spotAndReschedules]));
          setSplits([]);
        }
      }
      
      const exceptionsData = storageService.loadExceptions() || {};
      
      // 孤児データのフィルタリングを月間例外データにも適用
      const validCustomerIds = new Set(master.customers.map(c => c.id));
      const filteredExceptions = {};
      for (const [date, exp] of Object.entries(exceptionsData)) {
        filteredExceptions[date] = {
          spotJobs: (exp.spotJobs || []).filter(j => validCustomerIds.has(j.originalCustomerId)),
          cancellations: (exp.cancellations || []).filter(id => validCustomerIds.has(id)),
          reschedules: (exp.reschedules || []).filter(j => validCustomerIds.has(j.originalCustomerId))
        };
      }
      setMonthlyExceptions(filteredExceptions);

      setIsLoaded(true);
      clearHistory?.();
    };

    loadData();
  }, [dateStr, clearHistory]);

  // ==========================================
  // 4. 非同期アクション群 (API / Supabase対応前提)
  // ==========================================

  // --- Customers ---
  const saveCustomer = async (customerData) => {
    setMasterCustomers(prev => {
      const exists = prev.find(c => c.id === customerData.id);
      if (exists) {
        return prev.map(c => c.id === customerData.id ? customerData : c);
      }
      return [...prev, customerData];
    });

    const updateJobAttributes = (job) => {
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
      // 1. 無効化された顧客はカスケード削除 (絶対的マスタ登録の原則)
      setJobs(prev => prev.filter(j => j.originalCustomerId !== customerData.id));
      setPendingJobs(prev => prev.filter(j => j.originalCustomerId !== customerData.id));
      setMonthlyExceptions(prev => {
        const updated = {};
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
      // 2. 既存ジョブの属性同期
      setJobs(prev => prev.map(updateJobAttributes));
      
      // 3. 当日の未配車ジョブとスケジュールの同期
      if (dateStr) {
        const dailyJobsForToday = generateDailySchedule(dateStr, [customerData]);
        const shouldBeInScheduleToday = dailyJobsForToday.length > 0;

        setPendingJobs(prev => {
          const isCurrentlyInPending = prev.some(j => j.originalCustomerId === customerData.id);
          
          if (shouldBeInScheduleToday) {
            if (isCurrentlyInPending) {
              return prev.map(updateJobAttributes);
            } else {
              // 配車表に既に入っていなければ未配車に追加
              return uniqueJobs([...prev, ...dailyJobsForToday]);
            }
          } else {
            // 当日の定期回収スケジュールから外れた場合、自動生成された定期ジョブのみ未配車から削除する
            return prev.filter(j => j.originalCustomerId !== customerData.id || !j.id.startsWith('gen_'));
          }
        });
      } else {
        setPendingJobs(prev => prev.map(updateJobAttributes));
      }

      // 4. 月間スケジュール内の属性更新
      setMonthlyExceptions(prev => {
        const updated = {};
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

  const saveBulkCustomers = async (updatedCustomers) => {
    setMasterCustomers(updatedCustomers);
    
    const customerMap = new Map(updatedCustomers.map(c => [c.id, c]));
    const validIds = new Set(updatedCustomers.filter(c => !c.isInvalid).map(c => c.id));

    const syncJob = (job) => {
      const c = customerMap.get(job.originalCustomerId);
      if (!c) return job;
      return {
        ...job,
        title: c.name || job.title,
        kana: c.kana !== undefined ? c.kana : job.kana,
        area: c.area !== undefined ? c.area : job.area,
        duration: Number(c.defaultDuration) || job.duration || 30,
        preferredTime: c.preferredTime !== undefined ? c.preferredTime : job.preferredTime,
        requiredVehicle: c.requiredVehicle !== undefined ? c.requiredVehicle : job.requiredVehicle,
        items: c.items || job.items || [],
        note: c.note !== undefined ? c.note : job.note,
        holidayCollection: c.holidayCollection !== undefined ? c.holidayCollection : job.holidayCollection
      };
    };

    setJobs(prev => prev.filter(j => validIds.has(j.originalCustomerId)).map(syncJob));
    
    if (dateStr) {
      setPendingJobs(prev => {
        let newPending = prev.filter(j => validIds.has(j.originalCustomerId)).map(syncJob);
        
        for (const customer of updatedCustomers) {
          if (customer.isInvalid) continue;

          const dailyJobsForToday = generateDailySchedule(dateStr, [customer]);
          const shouldBeInScheduleToday = dailyJobsForToday.length > 0;
          const isCurrentlyInPending = newPending.some(j => j.originalCustomerId === customer.id);
          
          if (shouldBeInScheduleToday) {
            if (!isCurrentlyInPending) {
              newPending = uniqueJobs([...newPending, ...dailyJobsForToday]);
            } else {
              // すでに存在する場合はsyncJobで更新済み
            }
          } else {
            // スケジュールから外れた場合（スポット化など）、自動生成ジョブのみを削除
            newPending = newPending.filter(j => j.originalCustomerId !== customer.id || !j.id.startsWith('gen_'));
          }
        }
        return newPending;
      });
    } else {
      setPendingJobs(prev => prev.filter(j => validIds.has(j.originalCustomerId)).map(syncJob));
    }

    setMonthlyExceptions(prev => {
      const updated = {};
      for (const [d, exp] of Object.entries(prev)) {
        updated[d] = {
          spotJobs: (exp.spotJobs || []).filter(j => validIds.has(j.originalCustomerId)).map(syncJob),
          cancellations: (exp.cancellations || []).filter(id => validIds.has(id)),
          reschedules: (exp.reschedules || []).filter(j => validIds.has(j.originalCustomerId)).map(syncJob)
        };
      }
      return updated;
    });
  };

  const deleteCustomer = async (id) => {
    // 1. 顧客マスタから削除
    setMasterCustomers(prev => prev.filter(c => c.id !== id));
    
    // 2. カスケード処理: 該当する顧客のジョブを各データから物理削除
    clearHistory?.(); // Undoによる孤児データの復活を遮断
    setJobs(prev => prev.filter(j => j.originalCustomerId !== id));
    setPendingJobs(prev => prev.filter(j => j.originalCustomerId !== id));
    setMonthlyExceptions(prev => {
      const updated = {};
      for (const [date, exp] of Object.entries(prev)) {
        updated[date] = {
          spotJobs: (exp.spotJobs || []).filter(j => j.originalCustomerId !== id),
          cancellations: (exp.cancellations || []).filter(cid => cid !== id),
          reschedules: (exp.reschedules || []).filter(j => j.originalCustomerId !== id)
        };
      }
      return updated;
    });
  };

  // --- Workers ---
  const saveWorker = async (workerData, isEdit) => {
    setMasterWorkers(prev => {
      if (isEdit) return prev.map(w => w.id === workerData.id ? workerData : w);
      return [...prev, workerData];
    });
  };

  const deleteWorker = async (id) => {
    setMasterWorkers(prev => prev.filter(w => w.id !== id));
  };

  // --- Vehicles ---
  const saveVehicle = async (vehicleData, isEdit) => {
    setMasterVehicles(prev => {
      if (isEdit) return prev.map(v => v.id === vehicleData.id ? vehicleData : v);
      return [...prev, vehicleData];
    });
  };

  const deleteVehicle = async (id) => {
    setMasterVehicles(prev => prev.filter(v => v.id !== id));
  };

  // --- Items ---
  const saveItems = async (newItems) => {
    setMasterItems(newItems);
  };

  const deleteItem = async (id) => {
    setMasterItems(prev => prev.filter(i => i.id !== id));
  };

  // --- Jobs & Drivers (Daily) ---
  const saveJobs = async (newJobs) => {
    setJobs(newJobs);
  };
  
  const savePendingJobs = async (newPendingJobs) => {
    setPendingJobs(newPendingJobs);
  };

  const saveSplits = async (newSplits) => {
    setSplits(newSplits);
  };

  const saveDrivers = async (newDrivers) => {
    setDrivers(newDrivers);
  };

  // --- Calendar & SSOT Sync ---
  const addSpotJob = async (targetDates, spotJob) => {
    const dates = Array.isArray(targetDates) ? targetDates : [targetDates];

    // 1. 月間例外に登録
    setMonthlyExceptions(prev => {
      const next = { ...prev };
      dates.forEach(d => {
        const exp = next[d] || { spotJobs: [], cancellations: [], reschedules: [] };
        // 複数展開時はIDを日付サフィックスでユニーク化
        const newJob = dates.length > 1 ? { ...spotJob, id: `${spotJob.id}_${d}` } : spotJob;
        next[d] = {
          ...exp,
          spotJobs: [...exp.spotJobs, newJob]
        };
      });
      return next;
    });

    // 2. 日次データ（LocalStorage）の存在確認と同期、およびReact Stateの更新
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

  const deleteJobFromCalendar = async (targetDateStr, jobId, scope = 'this', seriesId = null) => {
    if (scope === 'this' || !seriesId) {
      // 既存の単一削除ロジック
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
        dailyState.jobs = (dailyState.jobs || []).filter(j => j.id !== jobId);
        dailyState.pendingJobs = (dailyState.pendingJobs || []).filter(j => j.id !== jobId);
        storageService.saveDailyState(targetDateStr, dailyState);
      }

      if (dateStr === targetDateStr) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        setPendingJobs(prev => prev.filter(j => j.id !== jobId));
      }
    } else {
      // 一括削除 ('future' または 'all')
      const isFuture = scope === 'future';
      
      // State更新
      setMonthlyExceptions(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(d => {
          if (isFuture && d < targetDateStr) return;
          const exp = next[d];
          if (exp && exp.spotJobs) {
            next[d] = {
              ...exp,
              spotJobs: exp.spotJobs.filter(j => j.seriesId !== seriesId)
            };
          }
        });
        return next;
      });

      // StorageExceptionsの全日付を走査して一括削除 (LocalStorageのdailyStateも)
      const allExceptions = storageService.loadExceptions() || {};
      Object.keys(allExceptions).forEach(d => {
        if (isFuture && d < targetDateStr) return;
        
        // 該当日の日次データからも削除
        const dailyState = storageService.loadDailyStateSync(d);
        if (dailyState) {
          const hasTarget = (dailyState.jobs || []).some(j => j.seriesId === seriesId) || 
                            (dailyState.pendingJobs || []).some(j => j.seriesId === seriesId);
          if (hasTarget) {
            dailyState.jobs = (dailyState.jobs || []).filter(j => j.seriesId !== seriesId);
            dailyState.pendingJobs = (dailyState.pendingJobs || []).filter(j => j.seriesId !== seriesId);
            storageService.saveDailyState(d, dailyState);
          }
        }
      });

      // カレント日付が対象範囲内ならReact Stateも更新
      if (!isFuture || dateStr >= targetDateStr) {
        setJobs(prev => prev.filter(j => j.seriesId !== seriesId));
        setPendingJobs(prev => prev.filter(j => j.seriesId !== seriesId));
      }
    }
  };

  const moveSpotJob = async (sourceDateStr, targetDateStr, jobId) => {
    if (sourceDateStr === targetDateStr) return;

    let jobToMove = null;
    
    // 1. sourceDateのデータ取得と月間例外更新
    setMonthlyExceptions(prev => {
      const sourceExp = prev[sourceDateStr] || { spotJobs: [], cancellations: [], reschedules: [] };
      jobToMove = sourceExp.spotJobs.find(j => j.id === jobId);
      if (!jobToMove) return prev;
      
      const targetExp = prev[targetDateStr] || { spotJobs: [], cancellations: [], reschedules: [] };
      return {
        ...prev,
        [sourceDateStr]: {
          ...sourceExp,
          spotJobs: sourceExp.spotJobs.filter(j => j.id !== jobId)
        },
        [targetDateStr]: {
          ...targetExp,
          spotJobs: [...targetExp.spotJobs, jobToMove]
        }
      };
    });

    // setTimeoutでjobToMoveの取得を待つのではなく、直前のmonthlyExceptionsの取得漏れを防ぐため
    // state反映前でもjobToMoveは参照可能(setState内のコールバックで取り出すのはクロージャの問題があるので直前に探す)
    const currentExp = monthlyExceptions[sourceDateStr] || { spotJobs: [] };
    jobToMove = jobToMove || currentExp.spotJobs.find(j => j.id === jobId);
    if (!jobToMove) return;

    // 2. 日次データ(LocalStorage)の同期
    const sourceDaily = storageService.loadDailyStateSync(sourceDateStr);
    if (sourceDaily) {
      const jobInJobs = (sourceDaily.jobs || []).find(j => j.id === jobId);
      const jobInPending = (sourceDaily.pendingJobs || []).find(j => j.id === jobId);
      const actualJobState = jobInJobs || jobInPending || jobToMove;
      
      // 移動先ではリセットして未配車にする
      jobToMove = { ...actualJobState, driverId: undefined, startTime: undefined };

      sourceDaily.jobs = (sourceDaily.jobs || []).filter(j => j.id !== jobId);
      sourceDaily.pendingJobs = (sourceDaily.pendingJobs || []).filter(j => j.id !== jobId);
      storageService.saveDailyState(sourceDateStr, sourceDaily);
    } else {
      jobToMove = { ...jobToMove, driverId: undefined, startTime: undefined };
    }

    const targetDaily = storageService.loadDailyStateSync(targetDateStr);
    if (targetDaily) {
      targetDaily.pendingJobs = uniqueJobs([...(targetDaily.pendingJobs || []), jobToMove]);
      storageService.saveDailyState(targetDateStr, targetDaily);
    }

    // 3. React Stateの同期
    if (dateStr === sourceDateStr) {
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setPendingJobs(prev => prev.filter(j => j.id !== jobId));
    }
    if (dateStr === targetDateStr) {
      setPendingJobs(prev => uniqueJobs([...prev, jobToMove]));
    }
  };

  return {
    // States
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

    // Actions
    saveCustomer,
    saveBulkCustomers,
    deleteCustomer,
    saveWorker,
    deleteWorker,
    saveVehicle,
    deleteVehicle,
    saveItems,
    deleteItem,
    
    // Calendar & SSOT Sync Actions
    addSpotJob,
    deleteJobFromCalendar,
    moveSpotJob,

    // Raw Setters (Temporary until full refactor of drag/drop)
    setJobs,
    setPendingJobs,
    setSplits,
    setDrivers,
    setMonthlyExceptions,
    setMasterItems,

    // History
    history,
    recordHistory,
    undo,
    redo,
    clearHistory
  };
}
