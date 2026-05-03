import { createContext, useContext } from 'react';
import type { DXUser } from '../../shared/types/auth';

export type AuthStatus = 'INITIALIZING' | 'OPTIMISTIC' | 'VERIFIED' | 'UNAUTHENTICATED';

export interface AuthContextValue {
    currentUser: DXUser | null;
    isLoading: boolean;
    authStatus: AuthStatus;
}

export const AuthContext = createContext<AuthContextValue>({ 
    currentUser: null, 
    isLoading: true,
    authStatus: 'INITIALIZING'
});


export const useAuth = () => useContext(AuthContext);
