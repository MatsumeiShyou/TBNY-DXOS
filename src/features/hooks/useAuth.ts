import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Staff } from '../../shared/types/staff';

export interface AuthContextValue {
    currentUser: User | null;
    currentStaff: Staff | null;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ 
    currentUser: null, 
    currentStaff: null,
    isLoading: true 
});

export const useAuth = () => useContext(AuthContext);
