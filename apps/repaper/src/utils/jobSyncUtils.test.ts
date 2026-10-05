import { describe, it, expect } from 'vitest';
import { mapJobForSync } from './jobSyncUtils';
import { Job, Driver } from '../types';

// 完全な Job 型を満たすモックファクトリ
const createMockJob = (id: string, driverId: string): Job => ({
  id,
  title: 'Test Job',
  driverId,
  duration: 60,
  bucket: 'morning'
});

describe('mapJobForSync', () => {
  const dateStr = '2026-10-04';
  const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';
  const validUUID2 = '987e6543-e21b-12d3-a456-426614174111';

  const mockDrivers: Driver[] = [
    { id: 'd1', name: validUUID1, currentVehicle: validUUID2 }, // アサインあり
    { id: 'd2', name: '未定', currentVehicle: '' } // アサインなし
  ];

  it('一時列ID(d1)が実際のUUIDに変換され、ui_column_idが保持されること', () => {
    const job = createMockJob('job1', 'd1');
    const result = mapJobForSync(job, dateStr, mockDrivers);
    
    expect(result.ui_column_id).toBe('d1');
    expect(result.workerId).toBe(validUUID1);
    expect(result.vehicleId).toBe(validUUID2);
  });

  it('アサイン未設定の列(d2)の場合、workerId等はnullになること', () => {
    const job = createMockJob('job2', 'd2');
    const result = mapJobForSync(job, dateStr, mockDrivers);
    
    expect(result.ui_column_id).toBe('d2');
    expect(result.workerId).toBeNull();
    expect(result.vehicleId).toBeNull();
  });

  it('既にUUIDがセットされている場合、ui_column_idはnullになること', () => {
    const job = createMockJob('job3', validUUID1);
    const result = mapJobForSync(job, dateStr, mockDrivers);
    
    expect(result.ui_column_id).toBeNull();
  });
});