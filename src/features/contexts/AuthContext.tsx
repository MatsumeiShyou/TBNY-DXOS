import { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../../shared/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { AuthAdapter } from '../../shared/lib/auth/AuthAdapter';
import type { Staff } from '../../shared/types/staff';
import { AuthContext, type AuthContextValue } from '../hooks/useAuth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user ?? null;
            setCurrentUser(user);
            
            if (user) {
                const staff = await AuthAdapter.getStaffByAuthUid(user.id);
                setCurrentStaff(staff);
            } else {
                setCurrentStaff(null);
            }
            setIsLoading(false);
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const user = session?.user ?? null;
            setCurrentUser(user);
            
            if (user) {
                const staff = await AuthAdapter.getStaffByAuthUid(user.id);
                setCurrentStaff(staff);
            } else {
                setCurrentStaff(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value: AuthContextValue = {
        currentUser,
        currentStaff,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
