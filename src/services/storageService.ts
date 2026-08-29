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
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
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
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase
        .from('daily_jobs')
        .select(`
          *,
          weighing_records (
            net_weight, operator_id
          ),
          actuals (
            actual_quantity, quantity_unit, is_finalized
          )
        `)
        .eq('planned_date', dateString);

      if (error) {
        console.error('Supabase loadDailyState Error:', error);
      }

      // 既存の LocalStorage も一応読み込んでおく (splits等の復元用)
      const dailyKey = `${STORAGE_KEY}_${dateString}`;
      const savedData = localStorage.getItem(dailyKey);
      let parsed = savedData ? JSON.parse(savedData) : null;

      if (data && data.length > 0) {
        // Supabase のデータがある場合はそれを優先してフロントエンド形式に変換
        const jobs = [];
        const pendingJobs = [];

        // sequence_order 順にソート
        const sortedData = data.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));

        for (const row of sortedData) {
          // 論理削除(is_skipped等)の除外
          if (row.is_skipped || row.status === 'DELETED') continue;
          
          const weighing = row.weighing_records?.[0] || {};
          const actual = row.actuals?.[0] || {};

          const job = {
            id: row.front_id || row.id,
            dbId: row.id,
            originalCustomerId: row.collection_point_id,
            driverId: row.vehicle_id || undefined,
            startTime: row.planned_time ? row.planned_time.substring(0, 5) : undefined,
            status: row.status,
            is_skipped: row.is_skipped,
            netWeight: weighing.net_weight,
            actualQuantity: actual.actual_quantity,
            quantityUnit: actual.quantity_unit,
            isFinalized: actual.is_finalized
          };

          if (row.vehicle_id) {
            jobs.push(job);
          } else {
            pendingJobs.push(job);
          }
        }

        return {
          jobs,
          pendingJobs,
          splits: parsed?.splits || [],
          drivers: parsed?.drivers || null
        };
      }

      // Supabase にデータがない場合、かつローカルにデータがあればそれを返す (移行期対応)
      let fileState = null;
      try {
        const response = await fetch(`/data/daily/${dateString}.json?t=${new Date().getTime()}`);
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          fileState = await response.json();
        }
      } catch (err) {}

      return fileState || parsed || null;
    } catch (e) {
      console.error(`Supabase daily_jobs 読み込みエラー(${dateString}):`, e);
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

  saveDailyState: async (dateString, state) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const dailyKey = `${STORAGE_KEY}_${dateString}`;
      localStorage.setItem(dailyKey, JSON.stringify(state));

      // ローカルファイルへの同期保存（後方互換）
      fetch('/api/save-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateString, state })
      }).catch(err => console.error('日次データファイル保存エラー:', err));

      const allJobs = [...(state.jobs || []), ...(state.pendingJobs || [])];
      
      if (allJobs.length > 0) {
        // 既存のレコードを取得してIDをマッピング
        const { data: existing } = await supabase
          .from('daily_jobs')
          .select('id, front_id')
          .eq('planned_date', dateString);
          
        const existingMap = new Map((existing || []).map(r => [r.front_id || '', r.id]));
        const currentFrontIds = new Set();

        const inserts = [];
        const updates = [];

        for (let i = 0; i < allJobs.length; i++) {
          const j = allJobs[i];
          if (!j.originalCustomerId) continue; // 不正データはスキップ
          
          currentFrontIds.add(j.id);
          
          const record = {
            front_id: j.id,
            collection_point_id: j.originalCustomerId,
            planned_date: dateString,
            vehicle_id: j.driverId || null,
            planned_time: j.startTime ? (j.startTime.length === 5 ? `${j.startTime}:00` : (j.startTime.length === 4 ? `0${j.startTime}:00` : j.startTime)) : null,
            sequence_order: i,
            status: j.status || 'PLANNED',
            is_skipped: !!j.is_skipped
          };

          const existingId = existingMap.get(j.id);
          if (existingId) {
            updates.push({ ...record, id: existingId });
          } else {
            inserts.push(record);
          }
        }

        // フロントエンドから削除されたジョブを論理削除（is_skipped = true, status = 'DELETED' など）
        const deletedUpdates = [];
        for (const [frontId, id] of existingMap.entries()) {
          if (!currentFrontIds.has(frontId)) {
            deletedUpdates.push({ id, status: 'DELETED', is_skipped: true });
          }
        }
        if (deletedUpdates.length > 0) {
          updates.push(...deletedUpdates);
        }

        // 新規登録
        if (inserts.length > 0) {
          const { error: insertErr } = await supabase.from('daily_jobs').insert(inserts);
          if (insertErr) console.error('Supabase saveDailyState INSERT Error:', insertErr);
        }

        // 更新と論理削除 (upsert)
        if (updates.length > 0) {
          const { error: updateErr } = await supabase.from('daily_jobs').upsert(updates, { onConflict: 'id' });
          if (updateErr) console.error('Supabase saveDailyState UPDATE/DELETE Error:', updateErr);
        }
      }
    } catch (e) {
      console.error(`Supabase保存エラー(${dateString}):`, e);
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
      // 1. Supabase からマスタデータを取得
      const { supabase } = await import('../lib/supabase');

      const [
        { data: itemsData, error: itemsErr },
        { data: workersData, error: workersErr },
        { data: vehiclesData, error: vehiclesErr },
        { data: pointsData, error: pointsErr }
      ] = await Promise.all([
        supabase.from('master_items').select('*'),
        supabase.from('master_workers').select('*'),
        supabase.from('master_vehicles').select('*'),
        supabase.from('master_collection_points').select(`
          id, name, address, target_item_codes, time_pattern, preferred_time, vehicle_lock, required_vehicle_id, schedule_rules, holiday_collection, default_duration, note, is_active, is_deleted,
          master_contractors (
            id, contractor_code, name,
            master_payers (
              id, payee_code, name
            )
          )
        `)
      ]);

      if (itemsErr) console.error('items fetch err:', itemsErr);
      if (workersErr) console.error('workers fetch err:', workersErr);
      if (vehiclesErr) console.error('vehicles fetch err:', vehiclesErr);
      if (pointsErr) console.error('points fetch err:', pointsErr);

      // フロントエンド向けの形式に変換
      const items = (itemsData || []).map(i => ({ id: i.item_code, name: i.name, is_active: i.is_active }));
      
      const workers = (workersData || []).map(w => ({
        id: w.id,
        name: w.name,
        kana: w.role_label,
        is_active: w.is_active
      }));

      const vehicles = (vehiclesData || []).map(v => ({
        id: v.id,
        name: v.vehicle_no,
        max_capacity_kg: v.capacity_kg
      }));

      const customers = (pointsData || []).map((p: any) => {
        const contractor = p.master_contractors || {};
        const payer = contractor.master_payers || {};
        return {
          id: p.id, // collection_point_id 
          supplierCode: contractor.contractor_code || '',
          supplierName: contractor.name || '',
          payeeCode: payer.payee_code || '',
          payeeName: payer.name || '',
          name: p.name,
          address: p.address || '',
          items: p.target_item_codes || [],
          preferredTime: p.preferred_time || '',
          requiredVehicle: p.vehicle_lock ? "yes" : "", // TODO: required_vehicle_id への紐付け
          scheduleRules: p.schedule_rules || { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
          holidayCollection: p.holiday_collection || false,
          defaultDuration: p.default_duration || 30,
          note: p.note || '',
          isInvalid: !p.is_active,
          isDeleted: !!p.is_deleted
        };
      });

      return {
        workers: workers.length > 0 ? workers : defaultWorkers,
        vehicles: vehicles.length > 0 ? vehicles : defaultVehicles,
        customers: customers.length > 0 ? customers : defaultCustomers,
        items: items.length > 0 ? items : defaultItems
      };
      
    } catch (e) {
      console.error('Supabaseマスタ読み込みエラー:', e);
    }
    return { workers: defaultWorkers, vehicles: defaultVehicles, customers: defaultCustomers, items: defaultItems };
  },

  saveMasterData: async ({ workers, vehicles, customers, items }) => {
    try {
      const { supabase } = await import('../lib/supabase');

      // 1. Itemsの保存
      if (items && items.length > 0) {
        const { error } = await supabase.from('master_items').upsert(
          items.map(i => ({ item_code: i.id, name: i.name, is_active: i.is_active })),
          { onConflict: 'item_code' }
        );
        if (error) console.error('Supabase Items save error:', error);
      }

      // 2. Workersの保存
      if (workers && workers.length > 0) {
        const { error } = await supabase.from('master_workers').upsert(
          workers.map(w => ({ id: w.id, name: w.name, role_label: w.kana, is_active: w.is_active })),
          { onConflict: 'id' }
        );
        if (error) console.error('Supabase Workers save error:', error);
      }

      // 3. Vehiclesの保存
      if (vehicles && vehicles.length > 0) {
        const { error } = await supabase.from('master_vehicles').upsert(
          vehicles.map(v => ({ id: v.id, vehicle_no: v.name, capacity_kg: v.max_capacity_kg, is_active: v.is_active })),
          { onConflict: 'id' }
        );
        if (error) console.error('Supabase Vehicles save error:', error);
      }

      // 4. Customers (3層) の保存
      if (customers && customers.length > 0) {
        // A: master_payers
        const payersToUpsert = [];
        const payerMap = new Map();
        for (const c of customers) {
          if (c.payeeCode && !payerMap.has(c.payeeCode)) {
            payerMap.set(c.payeeCode, true);
            payersToUpsert.push({ payee_code: c.payeeCode, name: c.payeeName || c.payeeCode, is_active: true });
          }
        }
        if (payersToUpsert.length > 0) {
          const { error } = await supabase.from('master_payers').upsert(payersToUpsert, { onConflict: 'payee_code' });
          if (error) console.error('Supabase Payers save error:', error);
        }

        // B: master_contractors (payer_idを引く必要があるため一度SELECTする)
        const { data: dbPayers } = await supabase.from('master_payers').select('id, payee_code');
        const dbPayerMap = new Map((dbPayers || []).map(p => [p.payee_code, p.id]));
        
        const contractorsToUpsert = [];
        const contractorMap = new Map();
        for (const c of customers) {
          if (c.supplierCode && !contractorMap.has(c.supplierCode)) {
            contractorMap.set(c.supplierCode, true);
            contractorsToUpsert.push({ 
              contractor_code: c.supplierCode, 
              name: c.supplierName || c.supplierCode,
              payer_id: dbPayerMap.get(c.payeeCode) || null,
              is_active: true
            });
          }
        }
        if (contractorsToUpsert.length > 0) {
          const { error } = await supabase.from('master_contractors').upsert(contractorsToUpsert, { onConflict: 'contractor_code' });
          if (error) console.error('Supabase Contractors save error:', error);
        }

        // C: master_collection_points (contractor_idを引く)
        const { data: dbContractors } = await supabase.from('master_contractors').select('id, contractor_code');
        const dbContractorMap = new Map((dbContractors || []).map(c => [c.contractor_code, c.id]));
        
        const pointsToUpsert = customers.map(c => ({
          id: c.id.startsWith('c_') ? undefined : c.id, // 新規の場合はUUID自動生成
          name: c.name,
          address: c.address,
          target_item_codes: c.items,
          time_pattern: 'FREE',
          vehicle_lock: !!c.requiredVehicle,
          schedule_rules: c.scheduleRules,
          holiday_collection: c.holidayCollection,
          default_duration: c.defaultDuration,
          note: c.note,
          is_active: !c.isInvalid,
          is_deleted: !!c.isDeleted,
          contractor_id: dbContractorMap.get(c.supplierCode) || null
        }));
        
        if (pointsToUpsert.length > 0) {
          const { error } = await supabase.from('master_collection_points').upsert(pointsToUpsert, { onConflict: 'id' });
          if (error) console.error('Supabase Collection Points save error:', error);
        }
      }
      
    } catch (e) {
      console.error('Supabaseマスタ保存エラー:', e);
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
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
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
