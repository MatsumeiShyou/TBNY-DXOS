export * from './types/index';
export * from './types/master';
export * from './logic/types';
import type { BoardJob, BoardSplit, BoardDriver, MasterVehicle, BoardAction, BoardActionType } from './types/index';
export type { BoardAction, BoardActionType };

import type { StaffRole } from '../../shared/types/staff';
export type { StaffPermissions } from '../../shared/types/auth';
export interface BoardState { 
    jobs: BoardJob[]; 
    pendingJobs: BoardJob[];
    splits: BoardSplit[];
    drivers: BoardDriver[]; 
    vehicles: MasterVehicle[]; 
    lastSync: string; 
}

export interface Staff { id: string; name: string; role: StaffRole; }
export interface ExceptionReasonMaster { id: string; label: string; color: string; }
