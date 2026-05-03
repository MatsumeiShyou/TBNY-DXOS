import { useState, useEffect, type ReactNode } from 'react';
import { AuthAdapter } from '../../shared/lib/auth/AuthAdapter';
import { AuthContext, type AuthContextValue } from '../hooks/useAuth';
import type { DXUser } from '../../shared/types/auth';
import type { Session } from '@supabase/supabase-js';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<DXUser | null>(null);
    const [authStatus, setAuthStatus] = useState<AuthStatus>(() => 
        AuthAdapter.hasCachedSession() ? 'OPTIMISTIC' : 'INITIALIZING'
    );
    const [isLoading, setIsLoading] = useState(() => !AuthAdapter.hasCachedSession());

    useEffect(() => {
        const initializeAuth = async () => {
            console.log(`[STATE] AuthProvider: Initialization started (Status: ${authStatus}).`);
            
            try {
                // セッション取得（バックグラウンドまたはフォアグラウンド）
                const { data: { session } } = await AuthAdapter.getSession();
                const user = session?.user ?? null;

                if (user) {
                    console.log('[DECISION] AuthProvider: Session user found. Fetching staff profile...');
                    // スタッフプロファイル取得
                    const staff = await AuthAdapter.getStaffByAuthUid(user.id);
                    
                    if (staff) {
                        console.log(`[STATE] AuthProvider: Staff profile verified: ${staff.name}`);
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
                                can_edit_past_records: staff.role === 'admin' || (staff.role as string) === 'manager'
                            }
                        });
                        setAuthStatus('VERIFIED');
                    } else {
                        console.warn('[STATE] AuthProvider: Staff profile not found for user.');
                        setAuthStatus('UNAUTHENTICATED');
                        setCurrentUser(null);
                    }
                } else {
                    console.log('[STATE] AuthProvider: No session user found.');
                    setAuthStatus('UNAUTHENTICATED');
                    setCurrentUser(null);
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
