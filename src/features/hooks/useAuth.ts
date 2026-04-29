import { createContext, useContext } from 'react';
import type { DXUser } from '../../shared/types/auth';

export interface AuthContextValue {
    currentUser: DXUser | null;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ 
    currentUser: null, 
    isLoading: true 
});


export const useAuth = () => useContext(AuthContext);
