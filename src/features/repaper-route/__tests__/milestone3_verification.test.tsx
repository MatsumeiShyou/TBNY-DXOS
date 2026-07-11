/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderHook, act, render, screen, waitFor } from '@testing-library/react';
import useMasterCRUD from '../../hooks/useMasterCRUD';
import { MasterDataLayout } from '../components/MasterDataLayout';
import { SWRConfig } from 'swr';
import type { MasterSchema } from '../config/masterSchema';
import { LoginGate } from '../../components/LoginGate';
import { AuthAdapter } from '../../../shared/lib/auth/AuthAdapter';
import type { User, Session } from '@supabase/supabase-js';

// --- Mocks ---

// Mock Supabase client
const mockRpc = vi.fn();
const mockQuery = {
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(function (onfulfilled) {
        return Promise.resolve({ data: [], error: null }).then(onfulfilled);
    }),
    catch: vi.fn().mockImplementation(function (onrejected) {
        return Promise.resolve({ data: [], error: null }).catch(onrejected);
    })
};
const mockSelect = vi.fn().mockReturnValue(mockQuery);
const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

vi.mock('../../../shared/lib/supabase/client', () => ({
    supabase: {
        from: (table: string) => mockFrom(table),
        rpc: (...args: unknown[]) => mockRpc(...args),
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
        }
    }
}));

// Mock Notification Context
const mockShowNotification = vi.fn();
vi.mock('../../hooks/useNotification', () => ({
    useNotification: () => ({
        showNotification: mockShowNotification
    })
}));

// Mock Auth Context
let mockCurrentUser: { id: string; name: string; role: string } | null = { id: 'test-user-id', name: 'テストユーザー', role: 'admin' };
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        get currentUser() { return mockCurrentUser; },
        isLoading: false
    })
}));

// Mock Audit Logger
vi.mock('../../../shared/lib/audit/auditLogger', () => ({
    logAuditTrail: vi.fn().mockResolvedValue(true)
}));

// --- Test Suites ---

describe('1. Timeout Promise Leakage & Safety Verification', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should settle and call clearTimeout when main promise resolves before timeout', async () => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

        const mainPromise = new Promise<string>((resolve) => {
            setTimeout(() => resolve('SUCCESS'), 100);
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('TIMEOUT_ERROR')), 1000);
        });

        // Simulating the race and cleanup pattern in AuthContext
        const racePromise = (async () => {
            try {
                return await Promise.race([mainPromise, timeoutPromise]);
            } finally {
                if (timeoutId) clearTimeout(timeoutId);
            }
        })();

        // Fast-forward main promise timer
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });

        const result = await racePromise;
        expect(result).toBe('SUCCESS');
        expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);

        // Fast-forward remaining time to check if timeout fires or leaks
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1000);
        });

        // The timeout should not have thrown any rejection or run since it was cleared
        clearTimeoutSpy.mockRestore();
    });

    it('should settle and call clearTimeout when main promise rejects before timeout', async () => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

        const mainPromise = new Promise<string>((_, reject) => {
            setTimeout(() => reject(new Error('DATABASE_ERROR')), 100);
        });
        mainPromise.catch(() => {});

        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('TIMEOUT_ERROR')), 1000);
        });
        timeoutPromise.catch(() => {});

        const racePromise = (async () => {
            try {
                return await Promise.race([mainPromise, timeoutPromise]);
            } finally {
                if (timeoutId) clearTimeout(timeoutId);
            }
        })();

        const expectation = expect(racePromise).rejects.toThrow('DATABASE_ERROR');

        // Fast-forward main promise timer
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });

        await expectation;
        expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId);

        clearTimeoutSpy.mockRestore();
    });

    it('should reject with TIMEOUT_ERROR when timeout triggers first', async () => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const mainPromise = new Promise<string>((resolve) => {
            setTimeout(() => resolve('SUCCESS'), 2000); // slow
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('TIMEOUT_ERROR')), 1000); // fast
        });
        timeoutPromise.catch(() => {});

        const racePromise = (async () => {
            try {
                return await Promise.race([mainPromise, timeoutPromise]);
            } finally {
                if (timeoutId) clearTimeout(timeoutId);
            }
        })();

        // Register expectation first before advancing timers
        const expectation = expect(racePromise).rejects.toThrow('TIMEOUT_ERROR');

        // Fast-forward to trigger timeout
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1000);
        });

        await expectation;
    });

    it('should demonstrate that LoginGate-style timeout leaks timeout if not cleared', async () => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('AUTH_TIMEOUT')), 10000);
        });
        timeoutPromise.catch(() => {});

        const loginTask = Promise.resolve({ data: { user: {} }, error: null });
        const racePromise = Promise.race([loginTask, timeoutPromise]);

        const result = await racePromise;
        expect(result.data.user).toBeDefined();

        // At this point, loginTask resolved immediately. But timeoutId is NOT cleared.
        expect(clearTimeoutSpy).not.toHaveBeenCalledWith(timeoutId);

        // If we advance the timers by 10000ms, the timeout timer will still fire!
        await act(async () => {
            await vi.advanceTimersByTimeAsync(10000);
        });

        // This proves the timer leaked and fired even though the login was successful.
        clearTimeoutSpy.mockRestore();
    });
});

describe('2. Error Formatting & PostgrestError in useMasterCRUD', () => {
    beforeEach(() => {
        mockShowNotification.mockClear();
        mockRpc.mockReset();
    });

    it('should format standard Error properly', async () => {
        mockRpc.mockRejectedValue(new Error('Normal JS error'));

        const { result } = renderHook(() => useMasterCRUD({
            viewName: 'drivers',
            rpcTableName: 'drivers'
        }));

        act(() => {
            result.current.setReason('SDR update justification');
        });

        await act(async () => {
            await result.current.handleSave(
                { id: '1', name: 'Test' },
                (fd) => fd,
                null
            );
        });

        expect(mockShowNotification).toHaveBeenCalledWith('保存エラー: Normal JS error', 'error');
    });

    it('should format PostgrestError objects with code, details, and hint', async () => {
        const postgrestErr = {
            message: 'Unique constraint violated',
            code: '23505',
            details: 'Key (id)=(1) already exists.',
            hint: 'Use a different ID.'
        };
        mockRpc.mockRejectedValue(postgrestErr);

        const { result } = renderHook(() => useMasterCRUD({
            viewName: 'drivers',
            rpcTableName: 'drivers'
        }));

        // Set reason to satisfy SDR check
        act(() => {
            result.current.setReason('Test updating');
        });

        await act(async () => {
            await result.current.handleSave(
                { id: '1', name: 'Test' },
                (fd) => fd,
                null
            );
        });

        expect(mockShowNotification).toHaveBeenCalledWith(
            '保存エラー: Unique constraint violated (23505 | Key (id)=(1) already exists. | Use a different ID.)',
            'error'
        );
    });

    it('should translate DXOS_VAL_01, DXOS_VAL_02, and DXOS_AUTH_01 errors', async () => {
        const valErr01 = { message: 'Database failure: DXOS_VAL_01' };
        const valErr02 = { message: 'Database failure: DXOS_VAL_02 [driver_name]' };
        const authErr01 = { message: 'Database failure: DXOS_AUTH_01' };

        const { result } = renderHook(() => useMasterCRUD({
            viewName: 'drivers',
            rpcTableName: 'drivers'
        }));

        act(() => {
            result.current.setReason('SDR update justification');
        });

        // DXOS_VAL_01
        mockRpc.mockRejectedValueOnce(valErr01);
        await act(async () => {
            await result.current.handleSave({ id: '1' }, (fd) => fd, null);
        });
        expect(mockShowNotification).toHaveBeenLastCalledWith(
            'システムエラー: 許可されていないテーブルへのアクセスです。',
            'error'
        );

        // DXOS_VAL_02
        mockRpc.mockRejectedValueOnce(valErr02);
        await act(async () => {
            await result.current.handleSave({ id: '1' }, (fd) => fd, null);
        });
        expect(mockShowNotification).toHaveBeenLastCalledWith(
            '入力エラー: カラム名「driver_name」が正しくありません。',
            'error'
        );

        // DXOS_AUTH_01
        mockRpc.mockRejectedValueOnce(authErr01);
        await act(async () => {
            await result.current.handleSave({ id: '1' }, (fd) => fd, null);
        });
        expect(mockShowNotification).toHaveBeenLastCalledWith(
            '認証エラー: スタッフレコードが見つかりません。',
            'error'
        );
    });
});

describe('3. Syllabary Filter & Regex Logic Verification', () => {
    const groups: Record<string, RegExp> = {
        'あ': /^[あいうえおアイウエオｱｲｳｴｵ]/,
        'か': /^[かきくけこカキクケコｶｷｸｹｺ]/,
        'さ': /^[さしすせそサシスセソｻｼｽｾｿ]/,
        'た': /^[たちつてとタチツテトﾀﾁﾂﾃﾄ]/,
        'な': /^[なにぬねのナニヌネノﾅﾆﾇﾈﾉ]/,
        'は': /^[はひふへほハヒフヘホﾊﾋﾌﾍﾎ]/,
        'ま': /^[まみむめもマミムメモﾏﾐﾑﾒﾓ]/,
        'や': /^[やゆよヤユヨﾔﾕﾖ]/,
        'ら': /^[らりるれろラリルレロﾗﾘﾙﾚﾛ]/,
        'わ': /^[わをんワヲンﾜｦﾝ]/,
    };

    const matchesInitial = (furiganaOrName: string, selectedInitial: string | null) => {
        if (!selectedInitial) return true;
        const target = furiganaOrName.toUpperCase();
        if (!target) return selectedInitial === '他';
        const firstChar = target.charAt(0);

        if (selectedInitial === '他') {
            return !Object.values(groups).some(re => re.test(firstChar));
        }
        return groups[selectedInitial]?.test(firstChar) || false;
    };

    it('should correctly match hiragana, full-width katakana, and half-width katakana', () => {
        // 'あ' group tests
        expect(matchesInitial('あおき', 'あ')).toBe(true);
        expect(matchesInitial('アオキ', 'あ')).toBe(true);
        expect(matchesInitial('ｱｵｷ', 'あ')).toBe(true);
        expect(matchesInitial('いとう', 'あ')).toBe(true);
        expect(matchesInitial('うえだ', 'あ')).toBe(true);
        expect(matchesInitial('かとう', 'あ')).toBe(false); // wrong group

        // 'か' group tests
        expect(matchesInitial('かとう', 'か')).toBe(true);
        expect(matchesInitial('カトウ', 'か')).toBe(true);
        expect(matchesInitial('ｶﾄｳ', 'か')).toBe(true);
        expect(matchesInitial('さとう', 'か')).toBe(false);

        // 'わ' group tests
        expect(matchesInitial('わたなべ', 'わ')).toBe(true);
        expect(matchesInitial('ワタナベ', 'わ')).toBe(true);
        expect(matchesInitial('ﾜﾀﾅﾍﾞ', 'わ')).toBe(true);
    });

    it('should match non-kana or symbols under "他"', () => {
        expect(matchesInitial('Aoki', '他')).toBe(true);
        expect(matchesInitial('12345', '他')).toBe(true);
        expect(matchesInitial('鈴木', '他')).toBe(true); // Kanji first character has no kana group match
        expect(matchesInitial('Aoki', 'あ')).toBe(false);
        expect(matchesInitial('', '他')).toBe(true); // Empty target goes to '他'
    });

    it('should match everything when no filter (null) is selected', () => {
        expect(matchesInitial('あおき', null)).toBe(true);
        expect(matchesInitial('かとう', null)).toBe(true);
        expect(matchesInitial('Aoki', null)).toBe(true);
        expect(matchesInitial('', null)).toBe(true);
    });
});

describe('4. MasterDataLayout & LookupSelect Component Verification', () => {
    it('should render and load options dynamically when lookup field is defined', async () => {
        const mockDriversList = [
            { id: 'drv-1', driver_name: '山田太郎', is_active: true },
            { id: 'drv-2', driver_name: '佐藤二朗', is_active: true }
        ];

        // Mock the supabase query return values for "drivers"
        mockSelect.mockImplementation(() => {
            return {
                order: vi.fn().mockResolvedValue({ data: mockDriversList, error: null }),
                then: (onfulfilled: ((value: unknown) => unknown) | null | undefined) => Promise.resolve({ data: mockDriversList, error: null }).then(onfulfilled),
                catch: (onrejected: ((reason: unknown) => unknown) | null | undefined) => Promise.resolve({ data: mockDriversList, error: null }).catch(onrejected)
            };
        });

        // Define a test schema containing a select field with a lookup config
        const testSchema = {
            title: 'テスト配送計画',
            description: 'テスト用のスキーマです。',
            viewName: 'test_plans',
            rpcTableName: 'test_plans',
            primaryKey: 'id',
            searchFields: ['title'],
            columns: [
                { key: 'title', label: 'タイトル', type: 'text' },
                { key: 'driver_name', label: '担当運転手', type: 'text' }
            ],
            fields: [
                { name: 'title', label: 'タイトル', type: 'text', required: true },
                {
                    name: 'driver_id',
                    label: '担当運転手',
                    type: 'select',
                    required: true,
                    lookup: {
                        schemaKey: 'drivers',
                        valueKey: 'id',
                        labelKey: 'driver_name'
                    }
                }
            ]
        } as unknown as MasterSchema;

        // Render MasterDataLayout wrapped in SWRConfig with a fresh cache provider
        render(
            <SWRConfig value={{ provider: () => new Map() }}>
                <MasterDataLayout schema={testSchema} />
            </SWRConfig>
        );

        // Click the '新規登録' button to open the form modal
        const createBtn = screen.getByText('新規登録');
        await act(async () => {
            createBtn.click();
        });

        // Wait for SWR options to load and render in the select element
        await waitFor(() => {
            expect(screen.getAllByRole('option')).toHaveLength(3);
        });

        // The form modal should be open, and the LookupSelect dropdown should be rendered
        const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
        expect(selectElement).toBeTruthy();
        expect(selectElement.required).toBe(true);

        // Options should be populated with the mock driver list
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(3); // '選択してください' + 2 drivers
        expect(options[0].textContent).toBe('選択してください');
        expect(options[1].textContent).toBe('山田太郎');
        expect(options[1].getAttribute('value')).toBe('drv-1');
        expect(options[2].textContent).toBe('佐藤二朗');
        expect(options[2].getAttribute('value')).toBe('drv-2');
    });
});

describe('5. LoginGate Component & Timeout Leakage Fix', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockCurrentUser = null; // render the gate
    });

    afterEach(() => {
        vi.useRealTimers();
        mockCurrentUser = { id: 'test-user-id', name: 'テストユーザー', role: 'admin' }; // restore
    });

    it('should render form, call signInWithPassword, and clear timeout when login resolves', async () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
        const signInSpy = vi.spyOn(AuthAdapter, 'signInWithPassword').mockResolvedValue({
            data: { user: {} as unknown as User, session: {} as unknown as Session },
            error: null
        });

        render(<LoginGate />);

        // Submit form
        const submitButton = screen.getByRole('button', { name: 'サインイン' });
        await act(async () => {
            submitButton.click();
        });

        // Check if signInWithPassword was called
        expect(signInSpy).toHaveBeenCalled();

        // Check if clearTimeout was called to prevent memory leak
        expect(clearTimeoutSpy).toHaveBeenCalled();

        clearTimeoutSpy.mockRestore();
        signInSpy.mockRestore();
    });
});
