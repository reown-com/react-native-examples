import { storage } from '@/utils/storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  themeMode: 'light' | 'dark';

  // Actions
  setThemeMode: (themeMode: 'light' | 'dark') => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      themeMode: Appearance.getColorScheme() || 'light',
      setThemeMode: (themeMode: 'light' | 'dark') => set({ themeMode }),
    }),
    {
      name: 'settings',
      version: 1,
      storage: {
        getItem: async (key) => {
          const value = await storage.getItem(key);
          return value ? { state: value } : null;
        },
        setItem: storage.setItem,
        removeItem: storage.removeItem,
      },
    },
  ),
);
