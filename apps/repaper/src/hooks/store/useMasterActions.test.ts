import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMasterActions } from './useMasterActions';
import { storageService } from '../../services/storageService';

vi.mock('../../services/storageService', () => ({
  storageService: {
    saveSingleCustomer: vi.fn().mockResolvedValue({ success: true, id: 'c_1' }),
    deleteWorker: vi.fn().mockResolvedValue({ success: true }),
    saveSingleWorker: vi.fn().mockResolvedValue({ success: true }),
    deleteVehicle: vi.fn().mockResolvedValue({ success: true }),
    saveSingleVehicle: vi.fn().mockResolvedValue({ success: true }),
    deleteItem: vi.fn().mockResolvedValue({ success: true }),
    saveSingleItem: vi.fn().mockResolvedValue({ success: true }),
    loadExceptions: vi.fn().mockResolvedValue({})
  }
}));

// mock supabase for deleteCustomer
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
      delete: vi.fn().mockReturnThis()
    }))
  }
}));

describe('useMasterActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getMockSetters = () => ({
    setMasterCustomers: vi.fn((fn) => {
      if (typeof fn === 'function') fn([]);
    }),
    setJobs: vi.fn((fn) => {
      if (typeof fn === 'function') fn([]);
    }),
    setPendingJobs: vi.fn((fn) => {
      if (typeof fn === 'function') fn([]);
    }),
    setMonthlyExceptions: vi.fn((fn) => {
      if (typeof fn === 'function') fn({});
    }),
    setMasterWorkers: vi.fn(),
    setMasterVehicles: vi.fn(),
    setMasterItems: vi.fn()
  });

  it('saveBulkCustomers should update masterCustomers and related jobs', async () => {
    const setters = getMockSetters();
    const historyOps = { clearHistory: vi.fn() };

    const { result } = renderHook(() => useMasterActions({ dateStr: '2026-10-05', setters, historyOps }));

    const updatedCustomers = [{ id: 'c_1', name: 'Bulk Test', isInvalid: false, isDeleted: false }];

    await act(async () => {
      await result.current.saveBulkCustomers(updatedCustomers);
    });

    // Directly sets the updated array
    expect(setters.setMasterCustomers).toHaveBeenCalledWith(updatedCustomers);
    
    // Updates related state via callbacks
    expect(setters.setJobs).toHaveBeenCalled();
    expect(setters.setPendingJobs).toHaveBeenCalled();
    expect(setters.setMonthlyExceptions).toHaveBeenCalled();
  });

  it('deleteCustomer with non-UUID should hard delete locally', async () => {
    const setters = getMockSetters();
    const historyOps = { clearHistory: vi.fn() };

    const { result } = renderHook(() => useMasterActions({ dateStr: '2026-10-05', setters, historyOps }));

    let res: any;
    await act(async () => {
      res = await result.current.deleteCustomer('c_temporary');
    });

    expect(res).toBe('hard');
    expect(setters.setMasterCustomers).toHaveBeenCalled();
    expect(setters.setJobs).toHaveBeenCalled();
    expect(setters.setPendingJobs).toHaveBeenCalled();
    expect(historyOps.clearHistory).toHaveBeenCalled();
  });

  it('deleteCustomer with UUID should query supabase and delete', async () => {
    const setters = getMockSetters();
    const historyOps = { clearHistory: vi.fn() };

    const { result } = renderHook(() => useMasterActions({ dateStr: '2026-10-05', setters, historyOps }));

    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    let res: any;
    await act(async () => {
      res = await result.current.deleteCustomer(uuid);
    });

    // Mocked to return count 0, so it will hard delete
    expect(res).toBe('hard');
    expect(setters.setMasterCustomers).toHaveBeenCalled();
  });
});
