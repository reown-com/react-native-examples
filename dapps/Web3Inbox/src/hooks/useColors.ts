import {Themes} from '@/utils/ThemeUtil';
import {useColorScheme} from 'react-native';

export default function useColors() {
  const scheme = useColorScheme();

  if (scheme === 'dark') {
    return Themes['dark'];
  }

  return Themes['light'];
}
