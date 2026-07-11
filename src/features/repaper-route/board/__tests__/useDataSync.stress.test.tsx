/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDataSync } from '../hooks/useDataSync';
import { nativeSupabaseFetch } from '../../lib/supabase/nativeFetch';
import { boardStore } from '../../lib/idb/boardStore';
import { PeriodicJobImporter } from '../../lib/PeriodicJobImporter';

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

// Mock Supabase client
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

describe('useDataSync - Stress and Race Condition Verification', () => {
    const mockDrivers = [{ id: 'd1', name: 'Driver 1', display_order: 1, is_active: true }];
    const getDefaultDrivers = () => mockDrivers;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('sb-mjaoolcjjlxwstlpdgrg-auth-token', JSON.stringify({ access_token: 'fake-token' }));
        vi.mocked(boardStore.get).mockResolvedValue(null);
        vi.mocked(PeriodicJobImporter.fetchPointsByDate).mockResolvedValue([]);
    });

    it('Race Condition: rapid date switching should not overwrite latest date with stale fetch result', async () => {
        // Resolve date A ('2026-07-01') slowly (200ms delay)
        vi.mocked(nativeSupabaseFetch).mockImplementation(async (table, query) => {
            if (query && query.includes('2026-07-01')) {
                await new Promise(resolve => setTimeout(resolve, 200));
                return {
                    data: [{
                        drivers: mockDrivers,
                        jobs: [{ id: 'job-A', title: 'Job A', bucket: 'AM' }],
                        pending: [],
                        splits: []
                    }],
                    error: null
                };
            }
            // Resolve date B ('2026-07-02') quickly (20ms delay)
            if (query && query.includes('2026-07-02')) {
                await new Promise(resolve => setTimeout(resolve, 20));
                return {
                    data: [{
                        drivers: mockDrivers,
                        jobs: [{ id: 'job-B', title: 'Job B', bucket: 'PM' }],
                        pending: [],
                        splits: []
                    }],
                    error: null
                };
            }
            return { data: [], error: null };
        });

        const { result, rerender } = renderHook(
            ({ date }) => useDataSync(date, getDefaultDrivers, 'admin'),
            { initialProps: { date: '2026-07-01' } }
        );

        // Switch date immediately to '2026-07-02'
        rerender({ date: '2026-07-02' });

        // Wait until loading completes for the second fetch
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // The current data should belong to '2026-07-02' (Job B)
        expect(result.current.data?.jobs[0].id).toBe('job-B');

        // Wait another 250ms to ensure the slow fetch resolves
        await new Promise(resolve => setTimeout(resolve, 250));

        // The data should STILL be '2026-07-02' (Job B), not overwritten by Job A
        expect(result.current.data?.jobs[0].id).toBe('job-B');
    });

    it('Edge Case: invalid date inputs should not crash the hook', async () => {
        vi.mocked(nativeSupabaseFetch).mockResolvedValue({
            data: [],
            error: null
        });

        const { result } = renderHook(() => 
            useDataSync('invalid-date', getDefaultDrivers, 'admin')
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Should return a clean empty state rather than throwing/crashing
        expect(result.current.error).toBeNull();
        expect(result.current.data).toBeDefined();
    });
});
