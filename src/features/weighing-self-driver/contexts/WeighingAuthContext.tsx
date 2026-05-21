/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useCallback } from 'react';
import type { UserSettings } from '../types';

type UserType = 'company' | 'customer';

interface WeighingAuthContextType {
  isAuthenticated: boolean;
  driverName: string | null;
  companyName: string | null;
  userType: UserType | null;
  userSettings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  isFirstLogin: boolean;
  login: (driverName: string, companyName: string | null, userType: UserType, settings: UserSettings) => void;
  logout: () => void;
  checkAuthState: () => Promise<void>;
  switchUser: () => void;
}

const WeighingAuthContext = createContext<WeighingAuthContextType | undefined>(undefined);

export const WeighingAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const checkAuthState = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedDriverName = localStorage.getItem('driverName');
      const storedCompanyName = localStorage.getItem('companyName');
      const storedUserType = localStorage.getItem('userType') as UserType | null;
      const storedSettings = localStorage.getItem('userSettings');
      const sessionActive = localStorage.getItem('sessionActive');

      if (storedDriverName) {
        setDriverName(storedDriverName);
        setCompanyName(storedCompanyName === 'null' ? null : storedCompanyName);
        setUserType(storedUserType);
        if (storedSettings) {
          setUserSettings(JSON.parse(storedSettings));
        }
        if (sessionActive === 'true') {
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.error('Failed to read auth state from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (name: string, compName: string | null, type: UserType, settings: UserSettings) => {
    const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore');
    if (!hasLoggedInBefore) {
      setIsFirstLogin(true);
      localStorage.setItem('hasLoggedInBefore', 'true');
    } else {
      setIsFirstLogin(false);
    }

    setIsAuthenticated(true);
    setDriverName(name);
    setCompanyName(compName);
    setUserType(type);
    setUserSettings(settings);
    localStorage.setItem('driverName', name);
    localStorage.setItem('companyName', compName || 'null');
    localStorage.setItem('userType', type);
    localStorage.setItem('userSettings', JSON.stringify(settings));
    localStorage.setItem('sessionActive', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setDriverName(null);
    setCompanyName(null);
    setUserType(null);
    setUserSettings(null);
    localStorage.removeItem('driverName');
    localStorage.removeItem('companyName');
    localStorage.removeItem('userType');
    localStorage.removeItem('userSettings');
    localStorage.removeItem('sessionActive');
    localStorage.removeItem('hasLoggedInBefore');
  };

  const switchUser = () => {
    logout();
  };

  return (
    <WeighingAuthContext.Provider value={{ isAuthenticated, driverName, companyName, userType, userSettings, isLoading, error, isFirstLogin, login, logout, checkAuthState, switchUser }}>
      {children}
    </WeighingAuthContext.Provider>
  );
};

export const useWeighingAuth = () => {
  const context = useContext(WeighingAuthContext);
  if (context === undefined) {
    throw new Error('useWeighingAuth must be used within a WeighingAuthProvider');
  }
  return context;
};
