import { useEffect, useRef } from 'react';
import { storageService } from '../../services/storageService';
import { syncQueue } from '../../lib/syncQueue';
import { mapJobForSync } from '../../utils/jobSyncUtils';
import { Job } from '../../types';
import { SyncBaseline } from './types';

const isSame = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);

/**
 * 状態の変更をロード時の基準（baselineRef）と比較し、差分だけをDBへ同期する。
 * App 側は素の setter で盤面を更新するため、永続化はここで一元的に行う。
 */
export function useAutoSync({ dateStr, isPreviewMode, state, baselineRef, showToast }: any) {
  const {
    masterWorkers,
    masterVehicles,
    masterCustomers,
    masterItems,
    drivers,
    jobs,
    pendingJobs,
    splits,
    monthlyExceptions,
    isLoaded
  } = state;

  // 日次データ（ジョブ・列設定・例外）は同期キュー経由で保存
  useEffect(() => {
    const base: SyncBaseline | null = baselineRef.current;
    // 別日付のロード中・プレビュー中・ロード失敗時は同期しない
    if (!isLoaded || isPreviewMode || !dateStr || !base || base.dateStr !== dateStr) return;

    const prevJobs = new Map<string, Job>([...base.jobs, ...base.pendingJobs].map((j: Job) => [j.id, j]));
    const prevOnBoard = new Set(base.jobs.map((j: Job) => j.id));
    const currentIds = new Set<string>();

    const enqueueJob = (job: Job, onBoard: boolean) => {
      currentIds.add(job.id);
      const prev = prevJobs.get(job.id);
      if (prev && isSame(prev, job) && prevOnBoard.has(job.id) === onBoard) return;
      // 未配車のジョブは古い driverId を保持していることがあるため、列IDを外して保存する
      const target = onBoard ? job : { ...job, driverId: undefined };
      syncQueue.enqueue('upsert', 'daily_jobs', job.id, mapJobForSync(target as Job, dateStr, drivers));
    };
    jobs.forEach((j: Job) => enqueueJob(j, true));
    pendingJobs.forEach((j: Job) => enqueueJob(j, false));

    for (const id of prevJobs.keys()) {
      if (!currentIds.has(id)) syncQueue.enqueue('delete', 'daily_jobs', id);
    }

    if (!isSame(base.drivers, drivers) || !isSame(base.splits, splits)) {
      syncQueue.enqueue('upsert', 'daily_configs', dateStr, { planned_date: dateStr, drivers, splits });
    }

    for (const [d, exp] of Object.entries(monthlyExceptions || {})) {
      if (!isSame(base.monthlyExceptions[d], exp)) {
        syncQueue.enqueue('upsert', 'monthly_exceptions', d, exp);
      }
    }

    baselineRef.current = { ...base, jobs, pendingJobs, drivers, splits, monthlyExceptions };
  }, [jobs, pendingJobs, drivers, splits, monthlyExceptions, isLoaded, isPreviewMode, dateStr]);

  // マスタデータは従来どおりデバウンスして一括保存（saveBulkCustomers などが依存）
  const saveMasterTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const base: SyncBaseline | null = baselineRef.current;
    if (!isLoaded || !base) return;
    const m = base.master;
    if (m.workers === masterWorkers && m.vehicles === masterVehicles && m.customers === masterCustomers && m.items === masterItems) return;

    base.master = { workers: masterWorkers, vehicles: masterVehicles, customers: masterCustomers, items: masterItems };
    if (saveMasterTimeout.current) clearTimeout(saveMasterTimeout.current);
    saveMasterTimeout.current = setTimeout(async () => {
      try {
        await storageService.saveMasterData({
          workers: masterWorkers,
          vehicles: masterVehicles,
          customers: masterCustomers,
          items: masterItems
        });
      } catch (err: any) {
        console.error('マスタ自動保存エラー:', err);
        showToast('マスタデータの保存に失敗しました: ' + (err.message || '不明なエラー'), 'error');
      }
    }, 500);
  }, [masterWorkers, masterVehicles, masterCustomers, masterItems, isLoaded]);
}
