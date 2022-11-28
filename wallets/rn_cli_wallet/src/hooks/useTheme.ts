import {useColorScheme} from 'react-native';

import {DarkTheme, LightTheme} from '@/utils/ThemeUtil';

export function useTheme() {
  const scheme = useColorScheme();
  const Theme = scheme === 'dark' ? DarkTheme : LightTheme;

  return Theme;
}
