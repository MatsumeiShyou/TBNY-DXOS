import { useState, useEffect, type ReactNode } from 'react';
import { AuthAdapter } from '../../shared/lib/auth/AuthAdapter';
import { AuthContext, type AuthContextValue, type AuthStatus } from '../hooks/useAuth';
import type { DXUser } from '../../shared/types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<DXUser | null>(() => 
        AuthAdapter.getCachedProfile()
    );
    const [authStatus, setAuthStatus] = useState<AuthStatus>(() => 
        AuthAdapter.hasCachedSession() ? 'OPTIMISTIC' : 'INITIALIZING'
    );
    const [isLoading, setIsLoading] = useState(() => !AuthAdapter.hasCachedSession());

    useEffect(() => {
        const initializeAuth = async () => {
            console.log(`[STATE] AuthProvider: Initialization started (Status: ${authStatus}).`);
            
            try {
                // [SAFETY] バックグラウンド検証でも 5秒以上かかる場合は「失敗」とみなして固着を防ぐ
                const timeout = new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('TIMEOUT')), 5000)
                );

                const verifyPromise = (async () => {
                    const { data: { session } } = await AuthAdapter.getSession();
                    const user = session?.user ?? null;

                    if (user) {
                        const staff = await AuthAdapter.getStaffByAuthUid(user.id);
                        if (staff) return { user, staff };
                    }
                    return null;
                })();

                // タイムアウトとの競争
                const result = await Promise.race([verifyPromise, timeout])
                    .catch(() => null);

                if (result) {
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
                    AuthAdapter.saveCachedProfile(verifiedUser); // 最新情報をキャッシュに保存
                    setAuthStatus('VERIFIED');
                } else {
                    console.log('[STATE] AuthProvider: Verification failed or timed out.');
                    setAuthStatus('UNAUTHENTICATED');
                    setCurrentUser(null);
                    AuthAdapter.clearCachedProfile(); // 不整合時はキャッシュも消去
                }
            } catch (error) {
                console.error('[STATE] AuthProvider: Initialization error:', error);
                setAuthStatus('UNAUTHENTICATED');
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = AuthAdapter.onAuthStateChange(async (_event, session) => {
            console.log(`[STATE] AuthProvider: Auth state changed: ${_event}`);
            const user = session?.user ?? null;
            
            try {
                if (user) {
                    const staff = await AuthAdapter.getStaffByAuthUid(user.id);
                    if (staff) {
                        setCurrentUser({
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
                                can_edit_past_records: (staff.role as string) === 'admin' || (staff.role as string) === 'manager'
                            }
                        });
                    } else {
                        setCurrentUser(null);
                    }
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('[STATE] AuthProvider: Error handling auth state change:', error);
            } finally {
                setIsLoading(false);
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
