import { storageService } from '../../services/storageService';
import { Job, Split, Driver } from '../../types';
import { MonthlyExceptions } from './types';
import { diffAndEnqueue, uniqueJobs } from './utils';
import { syncQueue } from '../../lib/syncQueue';

export function useDailyActions({ dateStr, state, setters }: any) {
  const {
    jobs,
    pendingJobs,
    splits,
    drivers,
    monthlyExceptions
  } = state;

  const {
    setJobs,
    setPendingJobs,
    setSplits,
    setDrivers,
    setMonthlyExceptions
  } = setters;

  const saveJobs = async (newJobs: Job[]) => {
    diffAndEnqueue(jobs, newJobs, 'daily_jobs', dateStr, drivers);
    setJobs(newJobs);
  };
  
  const savePendingJobs = async (newPendingJobs: Job[]) => {
    diffAndEnqueue(pendingJobs, newPendingJobs, 'daily_jobs', dateStr, drivers);
    setPendingJobs(newPendingJobs);
  };

  const saveSplits = async (newSplits: Split[]) => {
    syncQueue.enqueue('upsert', 'daily_configs', dateStr, { planned_date: dateStr, drivers, splits: newSplits });
    setSplits(newSplits);
  };

  const saveDrivers = async (newDrivers: Driver[]) => {
    syncQueue.enqueue('upsert', 'daily_configs', dateStr, { planned_date: dateStr, drivers: newDrivers, splits });
    setDrivers(newDrivers);
  };

  const addSpotJob = async (targetDates: string | string[], spotJob: any) => {
    const dates = Array.isArray(targetDates) ? targetDates : [targetDates];

    setMonthlyExceptions((prev: MonthlyExceptions) => {
      const next = { ...prev };
      for (const d of dates) {
        const exp = next[d] || { spotJobs: [], cancellations: [], reschedules: [] };
        const newJob = dates.length > 1 ? { ...spotJob, id: `${spotJob.id}_${d}` } : spotJob;
        next[d] = {
          ...exp,
          spotJobs: [...exp.spotJobs, newJob]
        };
        syncQueue.enqueue('upsert', 'monthly_exceptions', d, next[d]);
      }
      return next;
    });

    for (const d of dates) {
      const newJob = dates.length > 1 ? { ...spotJob, id: `${spotJob.id}_${d}` } : spotJob;
      const dailyState = await storageService.loadDailyState(d);
      if (dailyState) {
        dailyState.pendingJobs = uniqueJobs([...(dailyState.pendingJobs || []), newJob]);
        await storageService.saveDailyState(d, dailyState);
      }
      
      if (dateStr === d) {
        setPendingJobs((prev: Job[]) => uniqueJobs([...prev, newJob]));
      }
    }
  };

  const deleteJobFromCalendar = async (targetDateStr: string, jobId: string, scope = 'this', seriesId = null) => {
    if (scope === 'this' || !seriesId) {
      setMonthlyExceptions((prev: MonthlyExceptions) => {
        const exp = prev[targetDateStr] || { spotJobs: [], cancellations: [], reschedules: [] };
        const nextExp = {
          ...exp,
          spotJobs: exp.spotJobs.filter(j => j.id !== jobId)
        };
        syncQueue.enqueue('upsert', 'monthly_exceptions', targetDateStr, nextExp);
        return {
          ...prev,
          [targetDateStr]: nextExp
        };
      });

      const dailyState = await storageService.loadDailyState(targetDateStr);
      if (dailyState) {
        dailyState.jobs = (dailyState.jobs || []).filter((j: any) => j.id !== jobId);
        dailyState.pendingJobs = (dailyState.pendingJobs || []).filter((j: any) => j.id !== jobId);
        await storageService.saveDailyState(targetDateStr, dailyState);
      }

      if (dateStr === targetDateStr) {
        setJobs((prev: Job[]) => prev.filter(j => j.id !== jobId));
        setPendingJobs((prev: Job[]) => prev.filter(j => j.id !== jobId));
      }
    } else {
      const isFuture = scope === 'future';
      
      setMonthlyExceptions((prev: MonthlyExceptions) => {
        const next: MonthlyExceptions = { ...prev };
        Object.keys(next).forEach(d => {
          if (isFuture && d < targetDateStr) return;
          const exp = next[d];
          if (exp && exp.spotJobs) {
            next[d] = {
              ...exp,
              spotJobs: exp.spotJobs.filter((j: any) => j.seriesId !== seriesId)
            };
            syncQueue.enqueue('upsert', 'monthly_exceptions', d, next[d]);
          }
        });
        return next;
      });

      const allExceptions = await storageService.loadExceptions() || {};
      for (const d of Object.keys(allExceptions)) {
        if (isFuture && d < targetDateStr) continue;
        
        const dailyState = await storageService.loadDailyState(d);
        if (dailyState) {
          const hasTarget = (dailyState.jobs || []).some((j: any) => j.seriesId === seriesId) || 
                            (dailyState.pendingJobs || []).some((j: any) => j.seriesId === seriesId);
          if (hasTarget) {
            dailyState.jobs = (dailyState.jobs || []).filter((j: any) => j.seriesId !== seriesId);
            dailyState.pendingJobs = (dailyState.pendingJobs || []).filter((j: any) => j.seriesId !== seriesId);
            await storageService.saveDailyState(d, dailyState);
          }
        }
      }

      if (!isFuture || (dateStr && dateStr >= targetDateStr)) {
        setJobs((prev: Job[]) => prev.filter(j => j.seriesId !== seriesId));
        setPendingJobs((prev: Job[]) => prev.filter(j => j.seriesId !== seriesId));
      }
    }
  };

  const moveSpotJob = async (sourceDateStr: string, targetDateStr: string, jobId: string) => {
    if (sourceDateStr === targetDateStr) return;

    let jobToMove: any = null;
    
    setMonthlyExceptions((prev: MonthlyExceptions) => {
      const sourceExp = prev[sourceDateStr] || { spotJobs: [], cancellations: [], reschedules: [] };
      jobToMove = sourceExp.spotJobs.find((j: any) => j.id === jobId);
      if (!jobToMove) return prev;
      
      const targetExp = prev[targetDateStr] || { spotJobs: [], cancellations: [], reschedules: [] };
      
      const nextSource = {
        ...sourceExp,
        spotJobs: sourceExp.spotJobs.filter((j: any) => j.id !== jobId)
      };
      const nextTarget = {
        ...targetExp,
        spotJobs: [...targetExp.spotJobs, jobToMove]
      };
      
      syncQueue.enqueue('upsert', 'monthly_exceptions', sourceDateStr, nextSource);
      syncQueue.enqueue('upsert', 'monthly_exceptions', targetDateStr, nextTarget);
      
      return {
        ...prev,
        [sourceDateStr]: nextSource,
        [targetDateStr]: nextTarget
      };
    });

    const currentExp = monthlyExceptions[sourceDateStr] || { spotJobs: [] };
    jobToMove = jobToMove || currentExp.spotJobs.find((j: any) => j.id === jobId);
    if (!jobToMove) return;

    const sourceDaily = await storageService.loadDailyState(sourceDateStr);
    if (sourceDaily) {
      const jobInJobs = (sourceDaily.jobs || []).find((j: any) => j.id === jobId);
      const jobInPending = (sourceDaily.pendingJobs || []).find((j: any) => j.id === jobId);
      const actualJobState = jobInJobs || jobInPending || jobToMove;
      
      jobToMove = { ...actualJobState, driverId: undefined, startTime: undefined };

      sourceDaily.jobs = (sourceDaily.jobs || []).filter((j: any) => j.id !== jobId);
      sourceDaily.pendingJobs = (sourceDaily.pendingJobs || []).filter((j: any) => j.id !== jobId);
      await storageService.saveDailyState(sourceDateStr, sourceDaily);
    } else {
      jobToMove = { ...jobToMove, driverId: undefined, startTime: undefined };
    }

    const targetDaily = await storageService.loadDailyState(targetDateStr);
    if (targetDaily) {
      targetDaily.pendingJobs = uniqueJobs([...(targetDaily.pendingJobs || []), jobToMove]);
      await storageService.saveDailyState(targetDateStr, targetDaily);
    }

    if (dateStr === sourceDateStr) {
      setJobs((prev: Job[]) => prev.filter(j => j.id !== jobId));
      setPendingJobs((prev: Job[]) => prev.filter(j => j.id !== jobId));
    }
    if (dateStr === targetDateStr) {
      setPendingJobs((prev: Job[]) => uniqueJobs([...prev, jobToMove]));
    }
  };

  return {
    saveJobs,
    savePendingJobs,
    saveSplits,
    saveDrivers,
    addSpotJob,
    deleteJobFromCalendar,
    moveSpotJob
  };
}
