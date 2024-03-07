import {LightTheme} from '@/utils/ThemeUtil';
import {useColorScheme} from 'react-native';

export default function useTheme() {
  const scheme = useColorScheme();
  // TODO: Add dark theme when it's designed
  const Theme = scheme === 'dark' ? LightTheme : LightTheme;

  return Theme;
}
