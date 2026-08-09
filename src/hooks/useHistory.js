import { useState, useCallback } from 'react';

export function useHistory({ jobs, pendingJobs, splits, drivers }, { setJobs, setPendingJobs, setSplits, setDrivers }) {
  const [history, setHistory] = useState({ past: [], future: [] });

  const recordHistory = useCallback(() => {
    setHistory(prev => ({
      past: [...prev.past, { jobs, pendingJobs, splits, drivers }],
      future: []
    }));
  }, [jobs, pendingJobs, splits, drivers]);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      const newFuture = [{ jobs, pendingJobs, splits, drivers }, ...prev.future];

      setJobs(previous.jobs);
      setPendingJobs(previous.pendingJobs);
      setSplits(previous.splits);
      setDrivers(previous.drivers);

      return { past: newPast, future: newFuture };
    });
  }, [jobs, pendingJobs, splits, drivers, setJobs, setPendingJobs, setSplits, setDrivers]);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      const newPast = [...prev.past, { jobs, pendingJobs, splits, drivers }];

      setJobs(next.jobs);
      setPendingJobs(next.pendingJobs);
      setSplits(next.splits);
      setDrivers(next.drivers);

      return { past: newPast, future: newFuture };
    });
  }, [jobs, pendingJobs, splits, drivers, setJobs, setPendingJobs, setSplits, setDrivers]);

  return { history, recordHistory, undo, redo };
}
