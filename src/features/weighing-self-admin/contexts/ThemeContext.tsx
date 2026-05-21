/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { ThemeMode, EffectiveTheme, ThemeContextValue } from '../types';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('themeMode') as ThemeMode) || 'system';
  });

  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const effectiveTheme: EffectiveTheme = useMemo(() => {
    if (mode === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemPrefersDark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('themeMode', mode);
  }, [mode, effectiveTheme]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
