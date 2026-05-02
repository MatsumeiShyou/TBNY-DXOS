export * from './types/index';
export * from './types/master';
export * from './logic/types';
export type { BoardAction, BoardActionType } from './types/index';

export interface StaffPermissions {
    can_manage_master: boolean;
    can_view_audit: boolean;
    can_edit_board: boolean;
    can_edit_past_records: boolean;
}

export interface BoardState { 
    jobs: any[]; 
    pendingJobs: any[];
    splits: any[];
    drivers: any[]; 
    vehicles: any[]; 
    lastSync: string; 
}

export interface Staff { id: string; name: string; role: string; }
export interface ExceptionReasonMaster { id: string; label: string; color: string; }
