import {View, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import useTheme from '@/hooks/useTheme';

export interface Props {
  style?: StyleProp<ViewStyle>;
}

export function Divider({style}: Props) {
  const Theme = useTheme();
  return (
    <View
      style={[
        styles.divider,
        {backgroundColor: Theme['gray-glass-020']},
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
