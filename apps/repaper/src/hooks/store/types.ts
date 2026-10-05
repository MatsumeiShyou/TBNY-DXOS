import { Job } from '../../types';

export interface MasterItem {
  id: string;
  name: string;
  [key: string]: any;
}

export interface ExceptionData {
  spotJobs: Job[];
  cancellations: string[];
  reschedules: Job[];
}

export type MonthlyExceptions = Record<string, ExceptionData>;

// ロード直後（または最後に同期キューへ積んだ時点）の状態。自動同期の差分基準となる
export interface SyncBaseline {
  dateStr: string | null | undefined;
  jobs: Job[];
  pendingJobs: Job[];
  drivers: any[];
  splits: any[];
  monthlyExceptions: MonthlyExceptions;
  master: {
    workers: any[];
    vehicles: any[];
    customers: any[];
    items: MasterItem[];
  };
}
