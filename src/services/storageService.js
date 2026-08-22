const STORAGE_KEY = 'collection_shift_manager_data';
const MASTER_STORAGE_KEY = 'collection_shift_manager_master';
const EXCEPTIONS_STORAGE_KEY = 'collection_shift_manager_exceptions';
const TEMPLATES_STORAGE_KEY = 'collection_shift_manager_templates';

export const storageService = {
  loadTemplates: async () => {
    try {
      let fileTemplates = null;
      try {
        const response = await fetch('/data/templates.json?t=' + new Date().getTime());
        if (response.ok) {
          fileTemplates = await response.json();
        }
      } catch (err) {
        console.warn('ローカルの templates.json 読み込みに失敗しました', err);
      }
      
      const savedData = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      let parsed = savedData ? JSON.parse(savedData) : null;
      
      return fileTemplates || parsed || [];
    } catch (e) {
      console.error('LocalStorageテンプレート読み込みエラー:', e);
    }
    return [];
  },

  saveTemplates: (templates) => {
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
      fetch('/api/save-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templates)
      }).catch(err => console.error('テンプレートデータファイル保存エラー:', err));
    } catch (e) {
      console.error('LocalStorageテンプレート保存エラー:', e);
    }
  },

  saveTemplate: async (template) => {
    const currentTemplates = await storageService.loadTemplates();
    const index = currentTemplates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      currentTemplates[index] = template;
    } else {
      currentTemplates.push(template);
    }
    storageService.saveTemplates(currentTemplates);
  },

  deleteTemplate: async (id) => {
    const currentTemplates = await storageService.loadTemplates();
    const filtered = currentTemplates.filter(t => t.id !== id);
    storageService.saveTemplates(filtered);
  },

  loadDailyState: async (dateString) => {
    try {
      // 1. ファイルからのフェッチを試みる
      let fileState = null;
      try {
        const response = await fetch(`/data/daily/${dateString}.json?t=${new Date().getTime()}`);
        if (response.ok) {
          fileState = await response.json();
        }
      } catch (err) {
        console.warn(`ローカルの daily/${dateString}.json 読み込みに失敗しました`, err);
      }

      // 2. LocalStorage も確認
      const dailyKey = `${STORAGE_KEY}_${dateString}`;
      const savedData = localStorage.getItem(dailyKey);
      let parsed = savedData ? JSON.parse(savedData) : null;
      
      // ファイルを優先
      return fileState || parsed || null;
    } catch (e) {
      console.error(`LocalStorage読み込みエラー(${dateString}):`, e);
    }
    return null;
  },

  loadDailyStateSync: (dateString) => {
    try {
      const dailyKey = `${STORAGE_KEY}_${dateString}`;
      const savedData = localStorage.getItem(dailyKey);
      return savedData ? JSON.parse(savedData) : null;
    } catch (e) {
      console.error(`LocalStorage同期読み込みエラー(${dateString}):`, e);
    }
    return null;
  },

  saveDailyState: (dateString, state) => {
    try {
      const dailyKey = `${STORAGE_KEY}_${dateString}`;
      localStorage.setItem(dailyKey, JSON.stringify(state));

      // ローカルファイルへの同期保存
      fetch('/api/save-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateString, state })
      }).catch(err => console.error('日次データファイル保存エラー:', err));
    } catch (e) {
      console.error(`LocalStorage保存エラー(${dateString}):`, e);
    }
  },

  loadState: () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (e) {
      console.error('LocalStorage読み込みエラー:', e);
    }
    return null;
  },

  saveState: (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('LocalStorage保存エラー:', e);
    }
  },

  clearState: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('LocalStorage削除エラー:', e);
    }
  },

  loadMasterData: async (defaultWorkers = [], defaultVehicles = [], defaultCustomers = [], defaultItems = []) => {
    try {
      // 1. まずローカルのJSONファイルから最新のマスタをフェッチ
      let fileMaster = null;
      try {
        const response = await fetch('/data/master.json?t=' + new Date().getTime());
        if (response.ok) {
          fileMaster = await response.json();
        }
      } catch (err) {
        console.warn('ローカルのmaster.json読み込みに失敗しました', err);
      }

      // 2. LocalStorage も確認
      const savedData = localStorage.getItem(MASTER_STORAGE_KEY);
      let parsed = savedData ? JSON.parse(savedData) : null;
      
      // JSONファイルと LocalStorage でマージ（LocalStorageがあればそれを優先する過渡期の安全策）
      // ただし、今回は「ファイルから読み込んだデータを優先」するか「LocalStorageを優先」するか。
      // 基本はファイル（master.json）を正としつつ、LocalStorageにあればそこからもマージする。
      const baseCustomers = fileMaster?.customers || (parsed?.customers) || defaultCustomers;
      const baseWorkers = fileMaster?.workers || (parsed?.workers) || defaultWorkers;
      const baseVehicles = fileMaster?.vehicles || (parsed?.vehicles) || defaultVehicles;
      const baseItems = fileMaster?.items || (parsed?.items) || defaultItems;

      // 既存データの kana が空、または全角カタカナを含む場合にデフォルトデータ(半角)で上書きするマイグレーション
      const mergedCustomers = (Array.isArray(baseCustomers) ? baseCustomers : defaultCustomers).map(c => {
        const hasFullWidthKatakana = /[\u30A1-\u30F6]/.test(c.kana || '');
        if (!c.kana || hasFullWidthKatakana) {
          const defaultMatch = defaultCustomers.find(d => d.id === c.id);
          if (defaultMatch && defaultMatch.kana) {
            return { ...c, kana: defaultMatch.kana };
          }
        }
        return c;
      });

      return {
        workers: Array.isArray(baseWorkers) ? baseWorkers : defaultWorkers,
        vehicles: Array.isArray(baseVehicles) ? baseVehicles : defaultVehicles,
        customers: mergedCustomers,
        items: Array.isArray(baseItems) ? baseItems : defaultItems
      };
      
    } catch (e) {
      console.error('LocalStorageマスタ読み込みエラー:', e);
    }
    return { workers: defaultWorkers, vehicles: defaultVehicles, customers: defaultCustomers, items: defaultItems };
  },

  saveMasterData: ({ workers, vehicles, customers, items }) => {
    try {
      const data = { workers, vehicles, customers, items };
      localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(data));
      
      // ローカルファイルへの同期保存（ViteのローカルAPIへ非同期送信）
      fetch('/api/save-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(err => console.error('ローカルファイル保存エラー:', err));
      
    } catch (e) {
      console.error('LocalStorageマスタ保存エラー:', e);
    }
  },

  clearMasterData: () => {
    try {
      localStorage.removeItem(MASTER_STORAGE_KEY);
    } catch (e) {
      console.error('LocalStorageマスタ削除エラー:', e);
    }
  },

  clearAll: () => {
    storageService.clearState();
    storageService.clearMasterData();
    try { localStorage.removeItem(EXCEPTIONS_STORAGE_KEY); } catch (e) {}
  },

  loadExceptions: async () => {
    try {
      // 1. ファイルからのフェッチ
      let fileExceptions = null;
      try {
        const response = await fetch('/data/exceptions.json?t=' + new Date().getTime());
        if (response.ok) {
          fileExceptions = await response.json();
        }
      } catch (err) {
        console.warn('ローカルの exceptions.json 読み込みに失敗しました', err);
      }

      // 2. LocalStorage も確認
      const savedData = localStorage.getItem(EXCEPTIONS_STORAGE_KEY);
      let parsed = savedData ? JSON.parse(savedData) : null;
      
      return fileExceptions || parsed || {};
    } catch (e) {
      console.error('LocalStorage例外データ読み込みエラー:', e);
    }
    return {};
  },

  saveExceptions: (exceptions) => {
    try {
      localStorage.setItem(EXCEPTIONS_STORAGE_KEY, JSON.stringify(exceptions));
      
      // ローカルファイルへの同期保存
      fetch('/api/save-exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exceptions)
      }).catch(err => console.error('例外データファイル保存エラー:', err));
    } catch (e) {
      console.error('LocalStorage例外データ保存エラー:', e);
    }
  },
};
