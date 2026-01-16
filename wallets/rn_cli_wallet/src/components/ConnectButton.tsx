import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface IConnectButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ConnectButton({
  onPress,
  disabled,
  style,
}: IConnectButtonProps) {
  const Theme = useTheme();
  const backgroundColor = disabled
    ? Theme['foreground-tertiary']
    : Theme['bg-accent-primary'];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, { backgroundColor }, style]}
    >
      <Text variant="h6-500" color="text-invert">
        Connect
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius[5],
    height: 46,
    marginTop: Spacing[4],
  },
});
