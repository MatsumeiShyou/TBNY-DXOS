import { useState, useEffect, type ReactNode } from 'react';
import { AuthAdapter } from '../../shared/lib/auth/AuthAdapter';
import { AuthContext, type AuthContextValue } from '../hooks/useAuth';
import type { DXUser } from '../../shared/types/auth';
import type { Session } from '@supabase/supabase-js';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<DXUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            console.log('[STATE] AuthProvider: Initialization started.');
            
            try {
                // 5秒のタイムアウトを設定
                const timeout = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Auth Initialization Timeout (5s)')), 5000)
                );

                console.log('[DECISION] AuthProvider: Fetching session...');
                const { data: { session } } = await (Promise.race([
                    AuthAdapter.getSession(),
                    timeout
                ]) as Promise<{ data: { session: Session | null } }>);

                const user = session?.user ?? null;
                console.log(`[STATE] AuthProvider: User session ${user ? 'found' : 'not found'}.`);
                
                if (user) {
                    console.log('[DECISION] AuthProvider: Fetching staff profile...');
                    const staff = await AuthAdapter.getStaffByAuthUid(user.id);
                    if (staff) {
                        console.log(`[STATE] AuthProvider: Staff profile found: ${staff.name}`);
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
                    } else {
                        console.warn('[STATE] AuthProvider: No staff profile found for auth user.');
                        setCurrentUser(null);
                    }
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('[STATE] AuthProvider: Critical initialization error:', error);
                // エラー時もフォールバックとして未ログイン状態にする
                setCurrentUser(null);
            } finally {
                console.log('[DECISION] AuthProvider: Initialization complete, setting isLoading to false.');
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
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
