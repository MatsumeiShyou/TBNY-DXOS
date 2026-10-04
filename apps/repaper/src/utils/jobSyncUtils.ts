import { Job, Driver } from '../types';
import { parseUUID, UUID, isUUID } from './uuid';

export interface SyncJobPayload extends Omit<Job, 'workerId' | 'vehicleId' | 'dbId'> {
  dateStr: string;
  ui_column_id: string | null;
  workerId: UUID | null;
  vehicleId: UUID | null;
  dbId?: UUID;
}

export function mapJobForSync(job: Job, dateStr: string, drivers?: Driver[]): SyncJobPayload {
  const payload: SyncJobPayload = { 
    ...job, 
    dateStr, 
    ui_column_id: null,
    workerId: job.workerId || null,
    vehicleId: job.vehicleId || null
  };
  
  const dId = job.driverId;
  
  if (dId && !isUUID(dId)) {
    payload.ui_column_id = dId;
    if (drivers) {
      const col = drivers.find((d) => d.id === dId);
      payload.workerId = parseUUID(col?.name);
      payload.vehicleId = parseUUID(col?.currentVehicle);
    } else {
      payload.workerId = null;
      payload.vehicleId = null;
    }
  } else {
    payload.ui_column_id = null;
    // もし driverId に UUID が直接入っていた場合
    if (dId && isUUID(dId)) {
      payload.workerId = parseUUID(dId);
    }
  }
  
  return payload;
}