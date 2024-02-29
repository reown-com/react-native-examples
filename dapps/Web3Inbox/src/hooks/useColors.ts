import {DarkTheme, LightTheme} from '@/utils/ThemeUtil';
import {useColorScheme} from 'react-native';

export default function useColors() {
  const scheme = useColorScheme();
  const Theme = scheme === 'dark' ? DarkTheme : LightTheme;

  return Theme;
}
