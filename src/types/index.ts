/**
 * Collection Shift Manager
 * Core Domain Types (Single Source of Truth)
 * 
 * README.md の「データ構造」および「主要な状態管理」に基づき定義された型定義のSSOTです。
 */

// ==========================================
// 1. マスターデータ (Master Data)
// ==========================================

export interface MasterWorker {
  id: string;
  name: string;
  kana?: string;
  badges?: string[];
  status?: string;
  license_types?: string[];
  is_active?: boolean;
}

export interface MasterVehicle {
  id: string;
  name: string;
  type?: string;
  maxLoad?: number; // 最大積載量 (kg)
  heightLimit?: number; // 車高制限 (m)
  vehicle_type?: string;
  max_capacity_kg?: number | null;
}

export interface CustomerVisit {
  dayOfWeek?: string;
  timeWindow?: string;
  // TODO: 詳細要件に応じて拡張
  [key: string]: any; 
}

export interface Customer {
  id: string;
  name: string;
  kana?: string;
  area?: string;
  defaultDuration?: number; // 基準所要時間 (分)
  requiredVehicle?: string; // 必須車両
  visits?: CustomerVisit[];
  scheduleRules?: any;
  jobType?: "regular" | "spot";
  isInvalid?: boolean;
  isDeleted?: boolean;
  holidayCollection?: boolean;
  customSchedule?: string;
  [key: string]: any;
}

export interface ColorPalette {
  name: string;
  bg: string;
  border: string;
  text: string;
}

// ==========================================
// 2. トランザクションデータ (State/Timeline)
// ==========================================

export interface Driver {
  id: string;
  name: string;
  currentVehicle?: string;
  color?: string; // 未使用 (モック互換用)
  defaultSplit?: string;
  course?: string;
}

export interface Job {
  id: string;
  title: string;
  driverId?: string; // pendingJobの場合はnull/undefined
  startTime?: string; // "HH:MM" 形式
  duration: number; // 予定所要時間 (分)
  bucket?: string;
  originalCustomerId?: string; // 顧客マスタとの紐付け
  jobType?: "regular" | "spot";
  preferredTime?: string;
  area?: string;
  requiredVehicle?: string;
  note?: string;
  kana?: string;
  isReadOnly?: boolean;
  isOrphan?: boolean;
  isError?: boolean;
  isDeleted?: boolean; // マスタから完全に削除されたデータ
  isSuspended?: boolean; // マスタに存在するが一時停止中（無効）のデータ
  isVehicleError?: boolean;
  seriesId?: string;
  dbId?: string; // Supabaseの本来の UUID (job_id として利用)
  actualQuantity?: number;
  quantityUnit?: string;
  netWeight?: number;
  isFinalized?: boolean;
}

export interface Split {
  id: string;
  driverId: string; // どのタイムライン列での交代か
  time: string; // "HH:MM" 形式
  newDriverName?: string;
  newVehicleName?: string;
}

// ==========================================
// 3. アプリケーション全体状態 (App State)
// ==========================================

export interface HistorySnapshot {
  // Undo/Redo用のスナップショット
  // 必要に応じて具体的な状態を保持する
  [key: string]: any;
}

export interface AppState {
  drivers: Driver[];
  jobs: Job[];
  pendingJobs: Job[];
  splits: Split[];
  masterWorkers: MasterWorker[];
  masterVehicles: MasterVehicle[];
  customers: Customer[];
  history: {
    past: HistorySnapshot[];
    future: HistorySnapshot[];
  };
}
