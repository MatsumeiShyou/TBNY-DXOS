/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDataSync } from '../hooks/useDataSync';
import { supabase } from '../../../../shared/lib/supabase/client';
import { nativeSupabaseFetch } from '../../lib/supabase/nativeFetch';
import { boardStore } from '../../lib/idb/boardStore';
import { PeriodicJobImporter } from '../../lib/PeriodicJobImporter';

// Mock Supabase
const mockChannelOn = vi.fn().mockReturnThis();
const mockChannelSubscribe = vi.fn().mockImplementation((cb) => {
    if (cb) cb('SUBSCRIBED');
    return {
        on: mockChannelOn,
        subscribe: mockChannelSubscribe
    };
});
const mockChannel = {
    on: mockChannelOn,
    subscribe: mockChannelSubscribe
};
const mockRemoveChannel = vi.fn();

vi.mock('../../../../shared/lib/supabase/client', () => ({
    supabase: {
        channel: vi.fn(() => mockChannel),
        removeChannel: (...args: any[]) => mockRemoveChannel(...args)
    }
}));

// Mock nativeSupabaseFetch
vi.mock('../../lib/supabase/nativeFetch', () => ({
    nativeSupabaseFetch: vi.fn()
}));

// Mock PeriodicJobImporter
vi.mock('../../lib/PeriodicJobImporter', () => ({
    PeriodicJobImporter: {
        fetchPointsByDate: vi.fn()
    }
}));

// Mock boardStore
vi.mock('../../lib/idb/boardStore', () => ({
    boardStore: {
        get: vi.fn(),
        save: vi.fn(),
        clear: vi.fn()
    }
}));

describe('useDataSync - Hook Empirical and Stress Verification', () => {
    const defaultDate = '2026-07-12';
    const mockDrivers = [{ id: 'd1', name: 'Driver 1', display_order: 1, is_active: true }];
    const getDefaultDrivers = () => mockDrivers;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Default auth token exists
        localStorage.setItem('sb-mjaoolcjjlxwstlpdgrg-auth-token', JSON.stringify({ access_token: 'fake-token' }));
        
        // Mock default success fetches
        vi.mocked(nativeSupabaseFetch).mockResolvedValue({
            data: [{
                drivers: mockDrivers,
                jobs: [],
                pending: [],
                splits: []
            }],
            error: null
        });
        vi.mocked(PeriodicJobImporter.fetchPointsByDate).mockResolvedValue([]);
        vi.mocked(boardStore.get).mockResolvedValue(null);
    });

    afterEach(() => {
        // Clear in-memory cache by using a unique date key for each test case where cache behavior matters.
    });

    describe('1. Cache Bypass Logic', () => {
        it('should load data from fetch and then use in-memory cache on second hook render if not bypassed', async () => {
            const uniqueDate = '2026-07-01';
            
            // First render: loads from database
            const { result, rerender } = renderHook(() => 
                useDataSync(uniqueDate, getDefaultDrivers, 'admin')
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(nativeSupabaseFetch).toHaveBeenCalledTimes(1);

            // Rerender (should hit in-memory cache, not call fetch again)
            const { result: result2 } = renderHook(() => 
                useDataSync(uniqueDate, getDefaultDrivers, 'admin')
            );
            
            expect(result2.current.isLoading).toBe(false);
            expect(nativeSupabaseFetch).toHaveBeenCalledTimes(1); // Still 1
        });

        it('should bypass in-memory cache and IndexedDB cache when forceBypassCache is true (e.g. realtime updates)', async () => {
            const uniqueDate = '2026-07-02';
            
            // Render first time
            const { result } = renderHook(() => 
                useDataSync(uniqueDate, getDefaultDrivers, 'admin')
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
            expect(nativeSupabaseFetch).toHaveBeenCalledTimes(1);

            // Realtime callback simulation: it triggers fetchData(true) which is forceBypassCache = true
            // Let's capture the subscription callback and trigger it
            expect(mockChannelOn).toHaveBeenCalledWith(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'routes', filter: `date=eq.${uniqueDate}` },
                expect.any(Function)
            );

            const realtimeCallback = vi.mocked(mockChannelOn).mock.calls.find(
                call => call[0] === 'postgres_changes'
            )?.[2] as Function;

            expect(realtimeCallback).toBeDefined();

            // Trigger realtime change callback which calls fetchData(true)
            await act(async () => {
                await realtimeCallback();
            });

            // Fetch should have been triggered again (bypassing in-memory cache)
            expect(nativeSupabaseFetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('2. Offline-First Merging/Upgrades and Error Handling', () => {
        it('should load localData from IndexedDB, upgrade it, and display it even if Supabase fetch fails', async () => {
            const uniqueDate = '2026-07-03';
            
            // Setup local data with old/raw format jobs
            const oldLocalData = {
                drivers: mockDrivers,
                jobs: [{ id: 'job-1', title: 'Old Job', visit_slot: 'AM' }], // non-standard BoardJob format
                pendingJobs: [{ id: 'pending-1', job_title: 'Old Pending', bucket_type: 'PM' }],
                vehicles: [],
                lastSync: '2026-07-11T12:00:00Z'
            };
            vi.mocked(boardStore.get).mockResolvedValue(oldLocalData);

            // Supabase returns network error
            vi.mocked(nativeSupabaseFetch).mockResolvedValue({
                data: null,
                error: { message: 'Network disconnected', status: 0 }
            });

            const { result } = renderHook(() => 
                useDataSync(uniqueDate, getDefaultDrivers, 'admin')
            );

            // Hook should load from IndexedDB and upgrade immediately
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Verify upgraded state from IndexedDB is loaded
            expect(result.current.data).toBeDefined();
            expect(result.current.data?.jobs[0]).toEqual(expect.objectContaining({
                id: 'job-1',
                title: 'Old Job',
                bucket: 'AM' // correctly mapped by JobAdapter
            }));
            expect(result.current.data?.pendingJobs[0]).toEqual(expect.objectContaining({
                id: 'pending-1',
                title: 'Old Pending',
                bucket: 'PM' // correctly mapped by JobAdapter
            }));

            // Verify error boundary handling
            // Now that the bug is fixed, the error message is correctly displayed.
            expect(result.current.error).toBe('Network disconnected');
        });

        it('should handle corrupt job data in database/IndexedDB without crashing (Self-Healing)', async () => {
            const uniqueDate = '2026-07-04';

            // Simulate corrupt data with missing elements or nulls
            vi.mocked(nativeSupabaseFetch).mockResolvedValue({
                data: [{
                    drivers: mockDrivers,
                    jobs: [null, { id: 'valid-job', title: 'Valid' }], // includes a null entry
                    pending: [{ id: 'valid-pending', name: 'Valid Pending' }],
                    splits: null // splits is null
                }],
                error: null
            });

            const { result } = renderHook(() => 
                useDataSync(uniqueDate, getDefaultDrivers, 'admin')
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // The corrupt null entry is skipped, and only the valid job should load without throwing global error.
            expect(result.current.error).toBeNull();
            expect(result.current.data?.jobs).toHaveLength(1);
            expect(result.current.data?.jobs[0].id).toBe('valid-job');
        });
    });

    describe('3. Realtime Channel Updates and Unsubscribes Cleanly', () => {
        it('should delay subscription if no auth token is found', async () => {
            const uniqueDate = '2026-07-05';
            localStorage.removeItem('sb-mjaoolcjjlxwstlpdgrg-auth-token');

            const { result } = renderHook(() => 
                useDataSync(uniqueDate, getDefaultDrivers, 'admin')
            );

            // Hook should render but not subscribe or load
            expect(supabase.channel).not.toHaveBeenCalled();
            expect(nativeSupabaseFetch).not.toHaveBeenCalled();
        });

        it('should subscribe to correct channel and table when auth token is present', async () => {
            const uniqueDate = '2026-07-06';
            
            const { result } = renderHook(() => 
                useDataSync(uniqueDate, getDefaultDrivers, 'admin')
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(supabase.channel).toHaveBeenCalledWith(`sync_${uniqueDate}`);
            expect(mockChannelOn).toHaveBeenCalledWith(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'routes', filter: `date=eq.${uniqueDate}` },
                expect.any(Function)
            );
            expect(mockChannelSubscribe).toHaveBeenCalled();
        });

        it('should unsubscribe and remove channel cleanly on unmount', async () => {
            const uniqueDate = '2026-07-07';
            
            const { unmount } = renderHook(() => 
                useDataSync(uniqueDate, getDefaultDrivers, 'admin')
            );

            unmount();

            expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel);
        });
    });
});
