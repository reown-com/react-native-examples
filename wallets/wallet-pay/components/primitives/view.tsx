import { View as RNView, type ViewProps as RNViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ViewProps = RNViewProps;

export function View({ style, ...otherProps }: ViewProps) {
  const backgroundColor = useThemeColor({}, 'background');

  return <RNView style={[{ backgroundColor }, style]} {...otherProps} />;
}
