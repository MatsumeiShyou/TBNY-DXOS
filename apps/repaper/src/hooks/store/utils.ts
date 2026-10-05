import { syncQueue } from '../../lib/syncQueue';
import { mapJobForSync } from '../../utils/jobSyncUtils';
import { Job } from '../../types';

export function diffAndEnqueue<T extends { id: string }>(
  prevArray: T[], 
  newArray: T[], 
  entity: 'daily_jobs' | 'daily_configs', 
  dateStr: string,
  drivers?: any[]
) {
  const prevMap = new Map(prevArray.map(item => [item.id, item]));
  const currentMap = new Map(newArray.map(item => [item.id, item]));

  for (const item of newArray) {
    const prev = prevMap.get(item.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      let payload = entity === 'daily_jobs' 
        ? mapJobForSync(item as any, dateStr, drivers)
        : { ...item, dateStr };
      syncQueue.enqueue('upsert', entity, item.id, payload);
    }
  }
  for (const prev of prevArray) {
    if (!currentMap.has(prev.id)) {
      syncQueue.enqueue('delete', entity, prev.id);
    }
  }
}

// 重複排除（自己修復）用のヘルパー関数
export function uniqueJobs(jobsArray: Job[] | undefined): Job[] {
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
