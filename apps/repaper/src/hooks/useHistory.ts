import { useState, useCallback } from 'react';

export function useHistory({ jobs, pendingJobs, splits, drivers, monthlyExceptions }, { setJobs, setPendingJobs, setSplits, setDrivers, setMonthlyExceptions }) {
  const [history, setHistory] = useState({ past: [], future: [] });

  const recordHistory = useCallback(() => {
    setHistory(prev => ({
      past: [...prev.past, { jobs, pendingJobs, splits, drivers, monthlyExceptions }],
      future: []
    }));
  }, [jobs, pendingJobs, splits, drivers, monthlyExceptions]);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      const newFuture = [{ jobs, pendingJobs, splits, drivers, monthlyExceptions }, ...prev.future];

      setJobs(previous.jobs);
      setPendingJobs(previous.pendingJobs);
      setSplits(previous.splits);
      setDrivers(previous.drivers);
      if (previous.monthlyExceptions !== undefined) {
        setMonthlyExceptions(previous.monthlyExceptions);
      }

      return { past: newPast, future: newFuture };
    });
  }, [jobs, pendingJobs, splits, drivers, monthlyExceptions, setJobs, setPendingJobs, setSplits, setDrivers, setMonthlyExceptions]);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      const newPast = [...prev.past, { jobs, pendingJobs, splits, drivers, monthlyExceptions }];

      setJobs(next.jobs);
      setPendingJobs(next.pendingJobs);
      setSplits(next.splits);
      setDrivers(next.drivers);
      if (next.monthlyExceptions !== undefined) {
        setMonthlyExceptions(next.monthlyExceptions);
      }

      return { past: newPast, future: newFuture };
    });
  }, [jobs, pendingJobs, splits, drivers, monthlyExceptions, setJobs, setPendingJobs, setSplits, setDrivers, setMonthlyExceptions]);

  const clearHistory = useCallback(() => {
    setHistory({ past: [], future: [] });
  }, []);

  return { history, recordHistory, undo, redo, clearHistory };
}

