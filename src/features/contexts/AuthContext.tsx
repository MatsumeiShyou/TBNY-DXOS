import { useState, useEffect, type ReactNode } from 'react';
import { AuthAdapter } from '../../shared/lib/auth/AuthAdapter';
import { AuthContext, type AuthContextValue, type AuthStatus } from '../hooks/useAuth';
import type { DXUser } from '../../shared/types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<DXUser | null>(() => 
        AuthAdapter.getCachedProfile()
    );
    const [authStatus, setAuthStatus] = useState<AuthStatus>(() => {
        if (AuthAdapter.hasCachedSession()) return 'OPTIMISTIC';
        return 'UNAUTHENTICATED';
    });
    const [isLoading] = useState(false);

    /**
     * スタッフ情報を DXUser 型に変換する共通ロジック
     */
    const mapStaffToUser = (user: any, staff: any): DXUser => ({
        id: staff.id,
        name: staff.name,
        email: user.email || '',
        role: staff.role as DXUser['role'],
        allowed_apps: staff.allowed_apps as string[],
        last_event_id: staff.last_event_id,
        permissions: {
            can_manage_master: staff.role === 'admin' || staff.role === 'manager',
            can_view_audit: staff.role === 'admin' || staff.role === 'manager',
            can_edit_board: staff.role === 'admin' || staff.role === 'manager' || staff.role === 'staff',
            can_edit_past_records: staff.role === 'admin' || staff.role === 'manager'
        }
    });

    useEffect(() => {
        const initializeAuth = async () => {
            if (!AuthAdapter.hasCachedSession()) return;
            
            try {
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

                const result = await Promise.race([verifyPromise, timeout]).catch(() => null);

                if (result) {
                    const verifiedUser = mapStaffToUser(result.user, result.staff);
                    setCurrentUser(verifiedUser);
                    AuthAdapter.saveCachedProfile(verifiedUser);
                    setAuthStatus('VERIFIED');
                } else {
                    setAuthStatus('UNAUTHENTICATED');
                    setCurrentUser(null);
                    AuthAdapter.clearCachedProfile();
                }
            } catch (error) {
                console.error('[STATE] AuthContext: Initialization error:', error);
                setAuthStatus('UNAUTHENTICATED');
            }
        };

        initializeAuth();

        const { data: { subscription } } = AuthAdapter.onAuthStateChange(async (event, session) => {
            console.log(`[STATE] AuthContext: Event detected: ${event}`);
            
            // 認証成功・セッション確立・トークン更新時
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                const user = session?.user;
                if (user) {
                    try {
                        const staff = await AuthAdapter.getStaffByAuthUid(user.id);
                        if (staff) {
                            const dxUser = mapStaffToUser(user, staff);
                            setCurrentUser(dxUser);
                            AuthAdapter.saveCachedProfile(dxUser);
                            setAuthStatus('VERIFIED');
                        } else {
                            // ユーザーはいるがスタッフマスタにない場合
                            setAuthStatus('UNAUTHENTICATED');
                            setCurrentUser(null);
                        }
                    } catch (e) {
                        console.error('[STATE] AuthContext: Error fetching staff profile:', e);
                        // エラー時は安全のために未認証へ（または現在のキャッシュを維持）
                    }
                } else if (event !== 'INITIAL_SESSION') {
                    // セッションがない場合は未認証
                    setAuthStatus('UNAUTHENTICATED');
                    setCurrentUser(null);
                }
            } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                setCurrentUser(null);
                setAuthStatus('UNAUTHENTICATED');
                AuthAdapter.clearCachedProfile();
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
