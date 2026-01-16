import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

export interface ActionButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  secondary?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** When true, button expands to fill container width */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function ActionButton({
  onPress,
  children,
  secondary = false,
  loading,
  disabled,
  fullWidth = false,
  style,
  textStyle,
}: ActionButtonProps) {
  const Theme = useTheme();
  const backgroundColor = disabled
    ? Theme['foreground-accent-primary-60']
    : secondary
    ? Theme['foreground-tertiary']
    : Theme['bg-accent-primary'];
  const textColor = secondary ? Theme['text-primary'] : Theme['text-invert'];
  const loaderColor = secondary ? Theme['text-primary'] : Theme['text-invert'];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        { backgroundColor },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <Text variant="md-500" style={[{ color: textColor }, textStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius[4],
    paddingHorizontal: Spacing[4],
    height: Spacing[11],
    width: 100,
  },
  fullWidth: {
    width: '100%',
  },
});
