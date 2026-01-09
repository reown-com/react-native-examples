import { BorderRadius } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Button } from './primitives/button';

interface Props {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CloseModalButton({ onPress, style }: Props) {
  const borderColor = useThemeColor('border-secondary');
  const tintColor = useThemeColor('icon-inverse');

  return (
    <Button
      onPress={onPress}
      hitSlop={10}
      style={[styles.closeButton, { borderColor }, style]}>
      <Image
        source={require('@/assets/icons/close.png')}
        style={[styles.closeIcon, { tintColor }]}
      />
    </Button>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    borderWidth: 1,
    borderRadius: BorderRadius['3'],
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    width: 38,
  },
  closeIcon: {
    width: 13,
    height: 13,
  },
});
