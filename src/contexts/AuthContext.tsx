import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { AuthAdapter } from '../lib/auth/AuthAdapter';
import type { Staff } from '../types/staff';

interface AuthContextValue {
    currentUser: User | null;
    currentStaff: Staff | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ 
    currentUser: null, 
    currentStaff: null,
    isLoading: true 
});

export const useAuth = () => useContext(AuthContext);

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

        // Listen for changes
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
