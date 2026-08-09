import { INITIAL_DRIVERS, INITIAL_JOBS, CUSTOMERS } from '../data/constants';

const STORAGE_KEY = 'collection_shift_manager_data';
const MASTER_STORAGE_KEY = 'collection_shift_manager_master';

// =========================================
// デフォルト初期データの生成処理
// (App.jsxの初期化ロジックを移行)
// =========================================
const generateInitialState = () => {
  const generatedPendingJobs = [];
  const targetCustomers = CUSTOMERS.filter(c => ['c1', 'c2', 'c3', 'c4', 'c5'].includes(c.id));

  targetCustomers.forEach(customer => {
    customer.visits.forEach((visit, index) => {
      generatedPendingJobs.push({
        id: `p_${customer.id}_${index}`,
        title: customer.name + (visit.label ? ` (${visit.label})` : ''),
        kana: customer.kana || '',
        duration: customer.defaultDuration,
        note: visit.note || '',
        area: customer.area,
        preferredTime: visit.preferredTime || null,
        originalCustomerId: customer.id,
        requiredVehicle: customer.requiredVehicle
      });
    });
  });

  const initialSplits = INITIAL_DRIVERS.map((d) => {
    const base = { id: `split_${d.id}_init`, driverId: d.id }; 
    if (d.defaultSplit) {
      return { ...base, time: d.defaultSplit.time, driverName: d.defaultSplit.driverName, vehicle: d.defaultSplit.vehicle };
    }
    return { ...base, time: '13:00', driverName: d.name, vehicle: d.currentVehicle }; 
  });

  return {
    drivers: INITIAL_DRIVERS,
    jobs: INITIAL_JOBS,
    pendingJobs: generatedPendingJobs,
    splits: initialSplits
  };
};

export const storageService = {
  loadState: () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // 既存のpendingJobsにkanaがない場合のフォールバック補完
        if (parsed.pendingJobs) {
          parsed.pendingJobs = parsed.pendingJobs.map(job => {
            if (!job.kana) {
              const cust = CUSTOMERS.find(c => c.id === job.originalCustomerId);
              return { ...job, kana: cust ? cust.kana : job.title };
            }
            return job;
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error('LocalStorage読み込みエラー:', e);
    }
    return generateInitialState();
  },

  /**
   * データを保存する
   */
  saveState: (state) => {
    try {
      // { drivers, jobs, pendingJobs, splits } のセットを保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('LocalStorage保存エラー:', e);
    }
  },

  /**
   * 保存されたデータを消去し、初期状態にリセットする
   */
  clearState: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('LocalStorage削除エラー:', e);
    }
  },

  /**
   * マスターデータを読み込む（workers, vehicles）
   * 保存データがない場合は defaultWorkers / defaultVehicles を返却
   */
  loadMasterData: (defaultWorkers, defaultVehicles) => {
    try {
      const savedData = localStorage.getItem(MASTER_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
          workers: parsed.workers || defaultWorkers,
          vehicles: parsed.vehicles || defaultVehicles,
        };
      }
    } catch (e) {
      console.error('LocalStorageマスタ読み込みエラー:', e);
    }
    return { workers: defaultWorkers, vehicles: defaultVehicles };
  },

  /**
   * マスターデータを保存する
   */
  saveMasterData: ({ workers, vehicles }) => {
    try {
      localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify({ workers, vehicles }));
    } catch (e) {
      console.error('LocalStorageマスタ保存エラー:', e);
    }
  },
};
