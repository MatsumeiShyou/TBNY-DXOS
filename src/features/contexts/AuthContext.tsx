import { useState, useEffect, useRef, type ReactNode } from 'react';
import { AuthAdapter } from '../../shared/lib/auth/AuthAdapter';
import { AuthContext, type AuthContextValue, type AuthStatus } from '../hooks/useAuth';
import type { DXUser } from '../../shared/types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<DXUser | null>(() => 
        AuthAdapter.getCachedProfile()
    );
    const [authStatus, setAuthStatus] = useState<AuthStatus>(() => {
        if (AuthAdapter.hasCachedSession()) return 'OPTIMISTIC';
        return 'UNAUTHENTICATED'; // キャッシュがなければ即座に未ログイン確定
    });
    const [isLoading, setIsLoading] = useState(() => {
        // キャッシュがあれば検証のためにスプラッシュは出さない（OPTIMISTIC表示）
        // キャッシュがなければ即座にログイン画面を出すためスプラッシュは出さない
        return false; 
    });

    const verificationPromise = useRef<Promise<any> | null>(null);

    useEffect(() => {
        const verifyProfile = async (uid: string) => {
            if (verificationPromise.current) {
                return verificationPromise.current;
            }

            verificationPromise.current = (async () => {
                try {
                    const staffTimeout = new Promise<never>((_, reject) => 
                        setTimeout(() => reject(new Error('STAFF_FETCH_TIMEOUT')), 15000)
                    );
                    const staffFetch = AuthAdapter.getStaffByAuthUid(uid);
                    return await Promise.race([staffFetch, staffTimeout]);
                } catch (err) {
                    console.error('[STATE] AuthProvider: Profile verification failed:', err);
                    return null;
                } finally {
                    verificationPromise.current = null;
                }
            })();

            return verificationPromise.current;
        };

        const initializeAuth = async () => {
            console.log(`[STATE] AuthProvider: Initialization started (Status: ${authStatus}).`);
            
            try {
                // [SAFETY] 初期検証が 8秒以上かかる場合は強制中断
                const timeout = new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('INITIALIZE_TIMEOUT')), 30000)
                );

                const verifyPromise = (async () => {
                    const cachedUid = AuthAdapter.getCachedUserId();
                    
                    // [OPTIMIZATION] 並列実行: セッション確認と (あれば) プロフィール取得
                    const [sessionResult, preFetchedStaff] = await Promise.all([
                        AuthAdapter.getSession(),
                        cachedUid ? verifyProfile(cachedUid) : Promise.resolve(null)
                    ]);

                    const { data: { session } } = sessionResult;
                    const user = session?.user ?? null;

                    if (user) {
                        // セッション上の ID とキャッシュ ID が一致すれば事前取得分を使い、
                        // 不一致（別人または初回）なら改めて取得する
                        const staff = (cachedUid === user.id && preFetchedStaff) 
                            ? preFetchedStaff 
                            : await verifyProfile(user.id);
                        
                        return { user, staff };
                    }
                    return null;
                })();

                const result = await Promise.race([verifyPromise, timeout])
                    .catch((err) => {
                        console.error('[STATE] AuthProvider: Verification promise failed:', err);
                        return null;
                    });

                let finalStatus: AuthStatus = 'UNAUTHENTICATED';
                if (result && result.staff) {
                    const { user, staff } = result;
                    console.log(`[STATE] AuthProvider: Staff profile verified: ${staff.name}`);
                    
                    const verifiedUser: DXUser = {
                        id: staff.id,
                        name: staff.name,
                        email: user.email || '',
                        role: staff.role as DXUser['role'],
                        allowed_apps: staff.allowed_apps as string[],
                        last_event_id: staff.last_event_id,
                        permissions: {
                            can_manage_master: staff.role === 'admin' || (staff.role as string) === 'manager',
                            can_view_audit: staff.role === 'admin' || (staff.role as string) === 'manager',
                            can_edit_board: staff.role === 'admin' || (staff.role as string) === 'manager' || staff.role === 'staff',
                            can_edit_past_records: staff.role === 'admin' || (staff.role as string) === 'manager'
                        }
                    };

                    setCurrentUser(verifiedUser);
                    AuthAdapter.saveCachedProfile(verifiedUser);
                    finalStatus = 'VERIFIED';
                } else {
                    console.log('[STATE] AuthProvider: Verification failed, timed out, or no session.');
                    setCurrentUser(null);
                    AuthAdapter.clearCachedProfile();
                    finalStatus = 'UNAUTHENTICATED';
                }
                setAuthStatus(finalStatus);
            } catch (error: any) {
                console.error('[STATE] AuthProvider: Initialization error:', error);
                if (error.message === 'INITIALIZE_TIMEOUT') {
                    console.error('[CRITICAL] AuthProvider: Initialization timed out.');
                }
                setAuthStatus('UNAUTHENTICATED');
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
                // Note: We use a deferred check for the log if we want the actual state, 
                // but since we know what we set, we can log that.
                // However, for pure evidence, let's log the intention.
                console.log(`[STATE] AuthProvider: Initialization complete.`);
            }
        };

        initializeAuth();

        const { data: { subscription } } = AuthAdapter.onAuthStateChange(async (_event, session) => {
            console.log(`[STATE] AuthProvider: Auth state changed: ${_event} (Session: ${session ? 'Active' : 'None'})`);
            const user = session?.user ?? null;
            
            try {
                if (user) {
                    if (_event === 'SIGNED_OUT') {
                        setCurrentUser(null);
                        AuthAdapter.clearCachedProfile();
                        setAuthStatus('UNAUTHENTICATED');
                        return;
                    }

                    // [OPTIMIZATION & FIX] トークンリフレッシュ時、すでにキャッシュされた同一ユーザーであればプロフィールの再取得をスキップする。
                    // これにより、操作中の不要なDBアクセスと再レンダリング/ログアウトの競合を防ぐ。
                    const cachedUser = AuthAdapter.getCachedProfile();
                    if (_event === 'TOKEN_REFRESHED' && cachedUser && cachedUser.id === user.id) {
                        console.log(`[STATE] AuthProvider: Token refreshed for existing user. Skipping profile fetch.`);
                        setAuthStatus('VERIFIED');
                        return;
                    }

                    console.log(`[STATE] AuthProvider: Session found via AuthStateChange. Verifying...`);
                    const staff = await verifyProfile(user.id);

                    let finalStatus: AuthStatus = 'UNAUTHENTICATED';
                    if (staff) {
                        console.log(`[STATE] AuthProvider: Staff profile verified: ${staff.name}`);
                        const verifiedUser: DXUser = {
                            id: staff.id,
                            name: staff.name,
                            email: user.email || '',
                            role: staff.role as DXUser['role'],
                            allowed_apps: staff.allowed_apps as string[],
                            last_event_id: staff.last_event_id,
                            permissions: {
                                can_manage_master: staff.role === 'admin' || (staff.role as string) === 'manager',
                                can_view_audit: staff.role === 'admin' || (staff.role as string) === 'manager',
                                can_edit_board: staff.role === 'admin' || (staff.role as string) === 'manager' || staff.role === 'staff',
                                can_edit_past_records: staff.role === 'admin' || (staff.role as string) === 'manager'
                            }
                        };
                        setCurrentUser(verifiedUser);
                        AuthAdapter.saveCachedProfile(verifiedUser);
                        finalStatus = 'VERIFIED';
                    } else {
                        console.warn('[STATE] AuthProvider: No active staff profile found.');
                        setCurrentUser(null);
                        AuthAdapter.clearCachedProfile();
                        finalStatus = 'UNAUTHENTICATED';
                    }
                    setAuthStatus(finalStatus);
                } else {
                    console.log('[STATE] AuthProvider: No user session. Transitioning to UNAUTHENTICATED.');
                    setCurrentUser(null);
                    AuthAdapter.clearCachedProfile();
                    setAuthStatus('UNAUTHENTICATED');
                }
            } catch (error: any) {
                console.error('[STATE] AuthProvider: Error handling auth state change:', error);
                if (error.message === 'STAFF_FETCH_TIMEOUT') {
                    console.error('[CRITICAL] AuthProvider: Staff fetch timed out. UI may be stuck.');
                }
                setAuthStatus('UNAUTHENTICATED');
            } finally {
                setIsLoading(false);
                console.log(`[STATE] AuthProvider: State update processing complete.`);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const value: AuthContextValue = {
        currentUser,
        isLoading,
        authStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
