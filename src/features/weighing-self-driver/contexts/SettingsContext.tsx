/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback, useRef } from 'react';
import { useWeighingAuth } from './WeighingAuthContext';
import { useToast } from './ToastContext';
import { saveUserSettings } from '../services/gasApi';
import type { FontSize, Theme, UserSettings } from '../types';

interface SettingsContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isPulseEffectEnabled: boolean;
  setIsPulseEffectEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const applyFontSize = (size: FontSize) => {
    const root = document.documentElement;
    switch(size) {
        case 'sm':
            root.style.fontSize = '14px';
            break;
        case 'lg':
            root.style.fontSize = '18px';
            break;
        case 'md':
        default:
            root.style.fontSize = '16px';
            break;
    }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode; initialSettings: UserSettings | null }> = ({ children, initialSettings }) => {
    const { driverName } = useWeighingAuth();
    const { addToast } = useToast();

    const [fontSize, setFontSizeState] = useState<FontSize>('md');
    const [theme, setThemeState] = useState<Theme>('system');
    const [isPulseEffectEnabled, setIsPulseEffectEnabledState] = useState<boolean>(true);

    // Update local state when initialSettings (from AuthContext) changes
    useEffect(() => {
        setFontSizeState(initialSettings?.fontSize || 'md');
        setThemeState(initialSettings?.theme || 'system');
        setIsPulseEffectEnabledState(initialSettings?.isPulseEffectEnabled ?? true);
    }, [initialSettings]);

    // Apply font size to DOM
    useEffect(() => {
        applyFontSize(fontSize);
    }, [fontSize]);

    // Apply theme to DOM
    useEffect(() => {
        const root = window.document.documentElement;
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');

        const applyTheme = (isDark: boolean) => {
            if (isDark) {
                root.classList.add('dark');
                if (metaThemeColor) metaThemeColor.setAttribute('content', '#0f172a'); // slate-900
            } else {
                root.classList.remove('dark');
                if (metaThemeColor) metaThemeColor.setAttribute('content', '#f8fafc'); // slate-50
            }
        };

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches);

            const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            applyTheme(theme === 'dark');
        }
    }, [theme]);

    const settingsRef = useRef({ fontSize, theme, isPulseEffectEnabled });
    useEffect(() => {
        settingsRef.current = { fontSize, theme, isPulseEffectEnabled };
    }, [fontSize, theme, isPulseEffectEnabled]);

    const saveSettingsToApi = useCallback(async (key: keyof UserSettings, newValue: UserSettings[keyof UserSettings]) => {
        if (driverName) {
            try {
                const newSettings = { ...settingsRef.current, [key]: newValue };
                await saveUserSettings(driverName, newSettings);
                // Also update the settings in localStorage for session persistence
                localStorage.setItem('userSettings', JSON.stringify(newSettings));
            } catch (err) {
                console.error(err);
                addToast('設定の保存に失敗しました。', 'error');
            }
        }
    }, [driverName, addToast]);

    const setFontSize = useCallback((newValue: FontSize) => {
        setFontSizeState(newValue);
        saveSettingsToApi('fontSize', newValue);
    }, [saveSettingsToApi]);

    const setTheme = useCallback((newValue: Theme) => {
        setThemeState(newValue);
        saveSettingsToApi('theme', newValue);
    }, [saveSettingsToApi]);

    const setIsPulseEffectEnabled = useCallback((newValue: boolean) => {
        setIsPulseEffectEnabledState(newValue);
        saveSettingsToApi('isPulseEffectEnabled', newValue);
    }, [saveSettingsToApi]);


    const value = useMemo(() => ({
        fontSize,
        setFontSize: setFontSize as (size: FontSize) => void,
        theme,
        setTheme: setTheme as (theme: Theme) => void,
        isPulseEffectEnabled,
        setIsPulseEffectEnabled: setIsPulseEffectEnabled as (enabled: boolean) => void,
    }), [fontSize, setFontSize, theme, setTheme, isPulseEffectEnabled, setIsPulseEffectEnabled]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
