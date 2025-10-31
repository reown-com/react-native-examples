import { View as RNView, type ViewProps as RNViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = RNViewProps;

export function ThemedView({ style, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor('bg-primary');

  return <RNView style={[{ backgroundColor }, style]} {...otherProps} />;
}
