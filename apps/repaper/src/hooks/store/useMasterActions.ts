import { storageService } from '../../services/storageService';
import { Customer, MasterWorker, MasterVehicle, Job } from '../../types';
import { MasterItem, MonthlyExceptions } from './types';
import { generateDailySchedule } from '../../utils/calendarUtils';
import { uniqueJobs } from './utils';

export function useMasterActions({ dateStr, setters, historyOps }: any) {
  const {
    setMasterCustomers,
    setJobs,
    setPendingJobs,
    setMonthlyExceptions,
    setMasterWorkers,
    setMasterVehicles,
    setMasterItems
  } = setters;
  
  const { clearHistory } = historyOps;

  const saveCustomer = async (customerData: Customer & { isInvalid?: boolean; kana?: string; preferredTime?: string; items?: any[]; note?: string; holidayCollection?: boolean }) => {
    try {
      const res = await storageService.saveSingleCustomer(customerData);
      const newId = res.id;
      const oldId = customerData.id;
      
      const updatedCustomer = { ...customerData, id: newId };

      setMasterCustomers((prev: Customer[]) => {
        const exists = prev.find(c => c.id === oldId || c.id === newId);
        if (exists) {
          return prev.map(c => (c.id === oldId || c.id === newId) ? updatedCustomer : c);
        }
        return [...prev, updatedCustomer];
      });

      const updateJobAttributes = (job: Job | any): Job => {
        if (job.originalCustomerId !== oldId && job.originalCustomerId !== newId) return job;
        
        let newJobId = job.id;
        if (job.id.startsWith('gen_') && job.originalCustomerId === oldId) {
          newJobId = job.id.replace(oldId, newId);
        }
        
        return {
          ...job,
          id: newJobId,
          originalCustomerId: newId,
          title: updatedCustomer.name || job.title,
          kana: updatedCustomer.kana !== undefined ? updatedCustomer.kana : job.kana,
          area: updatedCustomer.area !== undefined ? updatedCustomer.area : job.area,
          duration: Number(updatedCustomer.defaultDuration) || job.duration || 30,
          preferredTime: updatedCustomer.preferredTime !== undefined ? updatedCustomer.preferredTime : job.preferredTime,
          requiredVehicle: updatedCustomer.requiredVehicle !== undefined ? updatedCustomer.requiredVehicle : job.requiredVehicle,
          items: updatedCustomer.items || job.items || [],
          note: updatedCustomer.note !== undefined ? updatedCustomer.note : job.note,
          holidayCollection: updatedCustomer.holidayCollection !== undefined ? updatedCustomer.holidayCollection : job.holidayCollection
        };
      };

      if (updatedCustomer.isInvalid) {
        setJobs((prev: Job[]) => prev.filter(j => j.originalCustomerId !== oldId && j.originalCustomerId !== newId));
        setPendingJobs((prev: Job[]) => prev.filter(j => j.originalCustomerId !== oldId && j.originalCustomerId !== newId));
        setMonthlyExceptions((prev: MonthlyExceptions) => {
          const updated: MonthlyExceptions = {};
          for (const [d, exp] of Object.entries(prev)) {
            updated[d] = {
              spotJobs: (exp.spotJobs || []).filter(j => j.originalCustomerId !== oldId && j.originalCustomerId !== newId),
              cancellations: (exp.cancellations || []).filter(id => id !== oldId && id !== newId),
              reschedules: (exp.reschedules || []).filter(j => j.originalCustomerId !== oldId && j.originalCustomerId !== newId)
            };
          }
          return updated;
        });
      } else {
        setJobs((prev: Job[]) => prev.map(updateJobAttributes));
        
        if (dateStr) {
          const currentExceptions = await storageService.loadExceptions() || {};
          const dailyJobsForToday = generateDailySchedule(dateStr, [updatedCustomer], [], (currentExceptions?.[dateStr]?.spotJobs || []));
          const shouldBeInScheduleToday = dailyJobsForToday.length > 0;

          setPendingJobs((prev: Job[]) => {
            const isCurrentlyInPending = prev.some(j => j.originalCustomerId === oldId || j.originalCustomerId === newId);
            
            if (shouldBeInScheduleToday) {
              if (isCurrentlyInPending) {
                return prev.map(updateJobAttributes);
              } else {
                return uniqueJobs([...prev, ...dailyJobsForToday]);
              }
            } else {
              return prev.filter(j => j.originalCustomerId !== oldId && j.originalCustomerId !== newId || !j.id.startsWith('gen_'));
            }
          });
        } else {
          setPendingJobs((prev: Job[]) => prev.map(updateJobAttributes));
        }

        setMonthlyExceptions((prev: MonthlyExceptions) => {
          const updated: MonthlyExceptions = {};
          for (const [d, exp] of Object.entries(prev)) {
            updated[d] = {
              ...exp,
              spotJobs: (exp.spotJobs || []).map(updateJobAttributes),
              reschedules: (exp.reschedules || []).map(updateJobAttributes),
              cancellations: (exp.cancellations || []).map(id => id === oldId ? newId : id)
            };
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to save customer:", err);
      throw err;
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
        newTitle = String(newTitle).replace(/^⚠️(削除済|停止中)\s*/, '');
        isDeleted = true;
      } else if (c.isInvalid) {
        newTitle = String(newTitle).replace(/^⚠️(削除済|停止中)\s*/, '');
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

    setJobs((prev: Job[]) => prev.filter(j => customerMap.has(j.originalCustomerId)).map(syncJob));
    
    if (dateStr) {
      const bulkExceptions = await storageService.loadExceptions() || {};
      setPendingJobs((prev: Job[]) => {
        let newPending = prev.filter(j => customerMap.has(j.originalCustomerId)).map(syncJob);
        
        for (const customer of updatedCustomers) {
          if (customer.isInvalid) continue;

          const dailyJobsForToday = generateDailySchedule(dateStr, [customer], [], (bulkExceptions?.[dateStr]?.spotJobs || []));
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
      setPendingJobs((prev: Job[]) => prev.filter(j => customerMap.has(j.originalCustomerId)).map(syncJob));
    }

    setMonthlyExceptions((prev: MonthlyExceptions) => {
      const updated: MonthlyExceptions = {};
      for (const [d, exp] of Object.entries(prev)) {
        updated[d] = {
          spotJobs: (exp.spotJobs || []).filter(j => customerMap.has(j.originalCustomerId)).map(syncJob),
          cancellations: (exp.cancellations || []),
          reschedules: (exp.reschedules || []).filter(j => customerMap.has(j.originalCustomerId)).map(syncJob)
        };
      }
      return updated;
    });
  };

  const deleteCustomer = async (id: string): Promise<'hard' | 'soft' | 'error'> => {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      if (!isUUID) {
        setMasterCustomers((prev: Customer[]) => prev.filter(c => c.id !== id));
        setJobs((prev: Job[]) => prev.filter(j => j.originalCustomerId !== id));
        setPendingJobs((prev: Job[]) => prev.filter(j => j.originalCustomerId !== id));
        if (clearHistory) clearHistory();
        return 'hard';
      }

      const { supabase } = await import('../../lib/supabase');
      const { count, error } = await supabase
        .from('daily_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('collection_point_id', id);

      if (error) throw error;

      if (count === 0) {
        const { error: delErr } = await supabase
          .from('master_collection_points')
          .delete()
          .eq('id', id);
        if (delErr) throw delErr;

        setMasterCustomers((prev: Customer[]) => prev.filter(c => c.id !== id));
        setJobs((prev: Job[]) => prev.filter(j => j.originalCustomerId !== id));
        setPendingJobs((prev: Job[]) => prev.filter(j => j.originalCustomerId !== id));
        setMonthlyExceptions((prev: MonthlyExceptions) => {
          const updated: MonthlyExceptions = {};
          for (const [d, exp] of Object.entries(prev)) {
            updated[d] = {
              spotJobs: (exp.spotJobs || []).filter(j => j.originalCustomerId !== id),
              cancellations: (exp.cancellations || []).filter(cId => cId !== id),
              reschedules: (exp.reschedules || []).filter(j => j.originalCustomerId !== id)
            };
          }
          return updated;
        });
        if (clearHistory) clearHistory();
        return 'hard';
      } else {
        setMasterCustomers((prev: Customer[]) => prev.map(c => c.id === id ? { ...c, isDeleted: true } : c));
        if (clearHistory) clearHistory();
        return 'soft';
      }
    } catch (e) {
      console.error('Customer deletion error:', e);
      setMasterCustomers((prev: Customer[]) => prev.map(c => c.id === id ? { ...c, isDeleted: true } : c));
      if (clearHistory) clearHistory();
      return 'error';
    }
  };

  const saveWorker = async (workerData: MasterWorker, isEdit: boolean) => {
    await storageService.saveSingleWorker(workerData);
    setMasterWorkers((prev: MasterWorker[]) => {
      if (isEdit) return prev.map(w => w.id === workerData.id ? workerData : w);
      return [...prev, workerData];
    });
  };

  const deleteWorker = async (id: string) => {
    const res = await storageService.deleteWorker(id);
    if (res.success) {
      setMasterWorkers((prev: MasterWorker[]) => prev.filter(w => w.id !== id));
    } else {
      console.error("Failed to delete worker:", res.error);
    }
  };

  const saveVehicle = async (vehicleData: MasterVehicle, isEdit: boolean) => {
    await storageService.saveSingleVehicle(vehicleData);
    setMasterVehicles((prev: MasterVehicle[]) => {
      if (isEdit) return prev.map(v => v.id === vehicleData.id ? vehicleData : v);
      return [...prev, vehicleData];
    });
  };

  const deleteVehicle = async (id: string) => {
    const res = await storageService.deleteVehicle(id);
    if (res.success) {
      setMasterVehicles((prev: MasterVehicle[]) => prev.filter(v => v.id !== id));
    } else {
      console.error("Failed to delete vehicle:", res.error);
    }
  };

  const saveItems = async (newItems: MasterItem[]) => {
    await Promise.all(newItems.map(item => storageService.saveSingleItem(item)));
    setMasterItems(newItems);
  };

  const deleteItem = async (id: string) => {
    const res = await storageService.deleteItem(id);
    if (res.success) {
      setMasterItems((prev: MasterItem[]) => prev.filter(i => i.id !== id));
    } else {
      console.error("Failed to delete item:", res.error);
    }
  };

  return {
    saveCustomer,
    saveBulkCustomers,
    deleteCustomer,
    saveWorker,
    deleteWorker,
    saveVehicle,
    deleteVehicle,
    saveItems,
    deleteItem
  };
}
