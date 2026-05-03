
export const StopStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS', // Arrived
  COMPLETED: 'COMPLETED',     // Departed
  SKIPPED: 'SKIPPED'
} as const;
export type StopStatus = (typeof StopStatus)[keyof typeof StopStatus];

export const DriverStatus = {
  IDLE: 'IDLE',       // 待機中
  DRIVING: 'DRIVING', // 移動中
  LOADING: 'LOADING', // 作業中
  OFFLINE: 'OFFLINE'  // 業務外/未ログイン
} as const;
export type DriverStatus = (typeof DriverStatus)[keyof typeof DriverStatus];

// --- SDR Core Definitions ---

export type ReasonCode = 
  | 'NORMAL_OPERATION' // 通常操作
  | 'INPUT_ERROR'      // 入力ミス
  | 'ON_SITE_INSTRUCTION' // 現場指示
  | 'TRAFFIC_JAM'      // 渋滞・遅延
  | 'EXCEPTION'        // その他例外
  | 'SYSTEM_AUTO';     // システム自動

export interface Reason {
  code: ReasonCode;
  text?: string; // 補足テキスト (User input)
}

export type DecisionType = 
  | 'STOP_ARRIVAL'      // 到着
  | 'STOP_COMPLETION'   // 作業完了
  | 'STOP_CORRECTION'   // 実績修正 (重要)
  | 'ROUTE_REORDER'     // 順序変更
  | 'SHIFT_START'       // 業務開始
  | 'SHIFT_END'         // 業務終了
  | 'TROUBLE_REPORT'    // トラブル報告
  | 'SWAP_REQUEST'      // 交換申請 (New)
  | 'SWAP_APPROVE'      // 交換承認 (New)
  | 'SWAP_REJECT'       // 交換却下 (New)
  | 'VEHICLE_SWAP';     // 車両交換 (New)

export interface Decision {
  id: string;
  type: DecisionType;
  timestamp: string; // ISO string
  actorId: string;
  targetId?: string; // StopID or RouteID or VehicleID
  reason: Reason;
  payload?: any; // The content of the decision (e.g., new weights, new order)
}

// ----------------------------

export interface CargoItem {
  id: string;
  name: string;
  // unit: string; // Removed per admin requirement (Always kg)
  defaultWeight: number;
  isCollected: boolean;
  actualWeight?: number; // User input
  isUnloaded?: boolean; // Has been unloaded at depot (Intermediate)
}

export interface Stop {
  id: string;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  scheduledTime: string;
  status: StopStatus;
  items: CargoItem[];
  notes?: string;
  arrivalTime?: string;
  departureTime?: string;
  isPriority?: boolean; // Urgent/Time sensitive
  
  // Admin App Integration Fields
  constraints?: {
    entryInstruction?: string; // e.g. "正門不可"
  };
  aiAlert?: {
    message: string; // e.g. "周辺混雑"
  };

  // Swap Status
  transferStatus?: 'REQUESTING' | 'ACCEPTED' | 'REJECTED'; 
}

export interface InspectionItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  isInspected: boolean; // Has daily inspection been done today?
  tareWeight: number; // 空車重量 (kg)
}

export interface BaseTask {
  id: string;
  label: string;
  checked: boolean;
}

export interface RouteInfo {
  id: string;
  name: string;
  area: string;
  stops: Stop[];
}

export interface User {
  id: string;
  name: string;
  vehicleId: string;
  vehicleName: string;
  currentStatus: DriverStatus;
}

export interface Colleague {
  id: string;
  name: string;
  status: DriverStatus;
  distance: string; // Mock distance text
  phoneNumber: string; // Added for mandatory call
}
