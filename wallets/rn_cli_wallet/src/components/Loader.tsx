import {ActivityIndicator} from 'react-native';

export function Loader({loading}: {loading: boolean}) {
  return loading ? <ActivityIndicator /> : null;
}
