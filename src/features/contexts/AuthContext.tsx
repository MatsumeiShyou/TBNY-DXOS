import { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../../shared/lib/supabase/client';
import { AuthAdapter } from '../../shared/lib/auth/AuthAdapter';
import { AuthContext, type AuthContextValue } from '../hooks/useAuth';
import type { DXUser } from '../../shared/types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<DXUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
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
                        last_event_id: staff.last_event_id
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

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
                        last_event_id: staff.last_event_id
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
