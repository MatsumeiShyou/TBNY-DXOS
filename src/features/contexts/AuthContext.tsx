import { useState, useEffect, type ReactNode } from 'react';
import { AuthAdapter } from '../../shared/lib/auth/AuthAdapter';
import { AuthContext, type AuthContextValue } from '../hooks/useAuth';
import type { DXUser } from '../../shared/types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<DXUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const { data: { session } } = await AuthAdapter.getSession();
            const user = session?.user ?? null;
            
            if (user) {
                const staff = await AuthAdapter.getStaffByAuthUid(user.id);
                if (staff) {
                    setCurrentUser({
                        id: staff.id,
                        name: staff.name,
                        email: user.email || '',
                        role: staff.role as any,
                        allowed_apps: staff.allowed_apps as any,
                        last_event_id: staff.last_event_id,
                        permissions: {
                            can_manage_master: staff.role === 'admin' || (staff.role as string) === 'manager',
                            can_view_audit: staff.role === 'admin' || (staff.role as string) === 'manager',
                            can_edit_board: staff.role === 'admin' || (staff.role as string) === 'manager' || staff.role === 'staff',
                            can_edit_past_records: staff.role === 'admin' || (staff.role as string) === 'manager'
                        }

                    });

                } else {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        };

        initializeAuth();

        const { data: { subscription } } = AuthAdapter.onAuthStateChange(async (_event, session) => {
            const user = session?.user ?? null;
            
            if (user) {
                const staff = await AuthAdapter.getStaffByAuthUid(user.id);
                if (staff) {
                    setCurrentUser({
                        id: staff.id,
                        name: staff.name,
                        email: user.email || '',
                        role: staff.role as any,
                        allowed_apps: staff.allowed_apps as any,
                        last_event_id: staff.last_event_id,
                        permissions: {
                            can_manage_master: staff.role === 'admin' || (staff.role as string) === 'manager',
                            can_view_audit: staff.role === 'admin' || (staff.role as string) === 'manager',
                            // @ts-ignore
                            can_edit_board: staff.role === 'admin' || (staff.role as string) === 'manager' || staff.role === 'staff'

                        ,
                            can_edit_past_records: (staff.role as string) === 'admin' || (staff.role as string) === 'manager'
}
                    });

                } else {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
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
