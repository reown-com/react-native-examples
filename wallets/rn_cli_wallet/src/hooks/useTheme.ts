import { useSnapshot } from 'valtio';

import { DarkTheme, LightTheme } from '@/utils/ThemeUtil';
import SettingsStore from '@/store/SettingsStore';

export function useTheme() {
  const { themeMode } = useSnapshot(SettingsStore.state);
  return themeMode === 'dark' ? DarkTheme : LightTheme;
}
