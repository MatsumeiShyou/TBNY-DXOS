// Supabase移行完了: すべてのデータは Supabase を単一の真実源（SSOT）として保存・読み込みする。

export const storageService = {
  loadTemplates: async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.from('templates').select('*').eq('is_active', true);
      if (error) console.error('Supabase loadTemplates Error:', error);

      if (data) {
        return data.map((t: any) => ({
          id: t.id,
          name: t.name,
          targetWeek: t.target_week,
          targetDay: t.target_day,
          state: t.ui_state || { jobs: [], pendingJobs: [], splits: [] }
        }));
      }
    } catch (e) {
      console.error('Supabaseテンプレート読み込みエラー:', e);
    }
    return [];
  },



  saveTemplate: async (template: any) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const payload = {
        id: template.id,
        name: template.name,
        target_week: template.targetWeek,
        target_day: template.targetDay,
        ui_state: template.state,
        is_active: true
      };
      const { error } = await supabase.from('templates').upsert(payload, { onConflict: 'id' });
      if (error) console.error('Supabase Template save error:', error);
    } catch (e) {
      console.error('Supabase Template save exception:', e);
    }
  },

  deleteTemplate: async (id: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('templates').update({ is_active: false }).eq('id', id);
      if (error) console.error('Supabase Template delete error:', error);
    } catch (e) {
      console.error('Supabase Template delete exception:', e);
    }
  },

  loadDailyState: async (dateString: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const [ { data, error }, { data: configData, error: configError } ] = await Promise.all([
        supabase
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
          .eq('planned_date', dateString),
        supabase
          .from('daily_configs')
          .select('drivers, splits')
          .eq('planned_date', dateString)
          .maybeSingle()
      ]);
      if (configError) console.error('Supabase loadDailyConfigs Error:', configError);
      if (error) console.error('Supabase loadDailyState Error:', error);

      if (data && data.length > 0) {
        const jobs: any[] = [];
        const pendingJobs: any[] = [];
        const sortedData = data.sort((a: any, b: any) => (a.sequence_order || 0) - (b.sequence_order || 0));

        for (const row of sortedData) {
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
            weight: weighing.net_weight || null,
            quantity: actual.actual_quantity || null,
            operator_id: weighing.operator_id || null,
            item_id: row.item_id || null
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
          splits: configData?.splits || [], 
          drivers: configData?.drivers?.length ? configData.drivers : undefined 
        };
      }
      
      if (configData) {
        return { 
          jobs: [], 
          pendingJobs: [], 
          splits: configData.splits || [], 
          drivers: configData.drivers?.length ? configData.drivers : undefined 
        };
      }
      
      return null;
    } catch (e) {
      console.error(`Supabase読み込みエラー(${dateString}):`, e);
    }
    return null;
  },



  saveDailyState: async (dateString: string, state: any) => {
    try {
      const { supabase } = await import('../lib/supabase');
      
      if (state.drivers || state.splits) {
        const { error: configErr } = await supabase.from('daily_configs').upsert({
          planned_date: dateString,
          drivers: state.drivers || [],
          splits: state.splits || []
        }, { onConflict: 'planned_date' });
        if (configErr) console.error('Supabase saveDailyConfigs Error:', configErr);
      }

      const allJobs = [...(state.jobs || []), ...(state.pendingJobs || [])];
      
      if (allJobs.length > 0) {
        const { data: existing } = await supabase
          .from('daily_jobs')
          .select('id, front_id')
          .eq('planned_date', dateString);
          
        const existingMap = new Map((existing || []).map((r: any) => [r.front_id || '', r.id]));
        const currentFrontIds = new Set();
        const inserts: any[] = [];
        const updates: any[] = [];

        for (const job of allJobs) {
          currentFrontIds.add(job.id);
          const payload = {
            planned_date: dateString,
            front_id: job.id,
            collection_point_id: job.originalCustomerId,
            vehicle_id: job.driverId || null,
            planned_time: job.startTime || null,
            status: job.status || 'PENDING'
          };

          if (existingMap.has(job.id)) {
            updates.push({ ...payload, id: existingMap.get(job.id) });
          } else {
            inserts.push(payload);
          }
        }

        if (existing) {
          for (const row of existing) {
            if (!currentFrontIds.has(row.front_id)) {
              updates.push({ id: row.id, status: 'DELETED' });
            }
          }
        }

        if (inserts.length > 0) {
          const { error: insertErr } = await supabase.from('daily_jobs').insert(inserts);
          if (insertErr) console.error('Supabase saveDailyState INSERT Error:', insertErr);
        }
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
    // Supabase移行完了: loadDailyStateが正規のロード処理を担うため、この関数は不要。
    return null;
  },

  saveState: (_state: any) => {
    // Supabase移行完了: saveDailyStateが正規の保存処理を担うため、この関数は不要。
    // 呼び出し元との互換性のためシグネチャのみ維持。
  },

  clearState: () => {
    // Supabase移行完了: ローカルキャッシュは使用しないため、no-op。
  },

  clearMasterData: () => {
    // Supabase移行完了: ローカルキャッシュは使用しないため、no-op。
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
          id, name, address, target_item_codes, time_pattern, preferred_time, vehicle_lock, required_vehicle_id, schedule_rules, holiday_collection, default_duration, note, is_active,
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
        kana: w.kana || w.role_label, // Fallback to role_label for older data
        license_types: w.license_types || [],
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
          isDeleted: false
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
          workers.map(w => ({ id: w.id, name: w.name, kana: w.kana, license_types: w.license_types, is_active: w.is_active })),
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



  deleteWorker: async (id: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('master_workers').delete().eq('id', id);
      if (error) {
        console.error('Supabase Worker delete error:', error);
        return { success: false, error };
      }
      return { success: true };
    } catch (e) {
      console.error('deleteWorker exception:', e);
      return { success: false, error: e };
    }
  },
  deleteVehicle: async (id: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('master_vehicles').delete().eq('id', id);
      if (error) {
        console.error('Supabase Vehicle delete error:', error);
        return { success: false, error };
      }
      return { success: true };
    } catch (e) {
      console.error('deleteVehicle exception:', e);
      return { success: false, error: e };
    }
  },
  deleteItem: async (id: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('master_items').delete().eq('id', id);
      if (error) {
        console.error('Supabase Item delete error:', error);
        return { success: false, error };
      }
      return { success: true };
    } catch (e) {
      console.error('deleteItem exception:', e);
      return { success: false, error: e };
    }
  },
  clearAll: () => {
    storageService.clearState();
    storageService.clearMasterData();
    // Supabase移行完了: ローカルキャッシュは使用しないため、no-op。
  },

  loadExceptions: async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.from('monthly_exceptions').select('*');
      if (error) console.error('Supabase loadExceptions Error:', error);
      
      const exceptions: any = {};
      if (data) {
        for (const row of data) {
          exceptions[row.target_date] = {
            spotJobs: row.spot_jobs || [],
            cancellations: row.cancellations || [],
            reschedules: row.reschedules || []
          };
        }
      }
      return exceptions;
    } catch (e) {
      console.error('Supabase例外データ読み込みエラー:', e);
    }
    return {};
  },

  saveExceptions: async (exceptions: any) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const upserts = Object.entries(exceptions).map(([date, exp]: [string, any]) => ({
        target_date: date,
        spot_jobs: exp.spotJobs || [],
        cancellations: exp.cancellations || [],
        reschedules: exp.reschedules || []
      }));
      
      if (upserts.length > 0) {
        const { error } = await supabase.from('monthly_exceptions').upsert(upserts, { onConflict: 'target_date' });
        if (error) console.error('Supabase Exceptions save error:', error);
      }
    } catch (e) {
      console.error('Supabase例外データ保存エラー:', e);
    }
  },
};
