// Step 5: Theme provider bridging Zustand store and React context
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { buildTheme, NeonAccent, ThemeTokens } from './tokens';

export type ThemeStore = {
  mode: 'dark' | 'light';
  accent: NeonAccent;
  fontScale: number;
  toggleMode: () => void;
  setAccent: (accent: NeonAccent) => void;
  setFontScale: (scale: number) => void;
};

const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      mode: 'dark',
      accent: 'violet',
      fontScale: 1,
      toggleMode: () => set(state => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
      setAccent: accent => set({ accent }),
      setFontScale: fontScale => set({ fontScale })
    }),
    {
      name: 'vyral-theme',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

type ThemeContextValue = {
  theme: ThemeTokens;
  mode: 'dark' | 'light';
  accent: NeonAccent;
  fontScale: number;
  toggleMode: () => void;
  setAccent: (accent: NeonAccent) => void;
  setFontScale: (scale: number) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { mode, accent, fontScale, toggleMode, setAccent, setFontScale } = useThemeStore();

  const theme = useMemo(() => buildTheme(mode, accent, fontScale), [mode, accent, fontScale]);

  useEffect(() => {
    // Step 5: we could hook analytics or logging for theme changes here
  }, [mode, accent, fontScale]);

  const value = useMemo(
    () => ({ theme, mode, accent, fontScale, toggleMode, setAccent, setFontScale }),
    [theme, mode, accent, fontScale, toggleMode, setAccent, setFontScale]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useNeonTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useNeonTheme must be used inside ThemeProvider');
  }
  return context;
};

export const useThemeStoreBase = useThemeStore;
