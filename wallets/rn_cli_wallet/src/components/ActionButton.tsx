import {
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';

type ButtonVariant = 'primary' | 'secondary';

export interface ActionButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  /** Button variant: 'primary' (accent/blue) or 'secondary' (gray outline) */
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  silentDisabled?: boolean;
  /** When true, button expands to fill container width */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export function ActionButton({
  onPress,
  children,
  variant = 'primary',
  loading,
  disabled,
  silentDisabled = false,
  fullWidth = false,
  style,
  textStyle,
  testID,
}: ActionButtonProps) {
  const Theme = useTheme();

  const getButtonStyles = () => {
    if (variant === 'primary') {
      // Primary: Blue filled button (accent color)
      return {
        backgroundColor: disabled
          ? Theme['foreground-accent-primary-60']
          : Theme['bg-accent-primary'],
        textColor: Theme['text-invert'],
        borderColor: disabled ? 'transparent' : Theme['bg-accent-primary'],
      };
    }

    // Secondary: Gray outline button
    return {
      backgroundColor: Theme['bg-primary'],
      textColor: disabled ? Theme['text-secondary'] : Theme['text-primary'],
      borderColor: disabled
        ? Theme['border-primary']
        : Theme['border-secondary'],
    };
  };

  const { backgroundColor, textColor, borderColor } = getButtonStyles();
  const loaderColor = textColor;

  return (
    <Button
      onPress={onPress}
      testID={testID}
      disabled={disabled || loading || silentDisabled}
      style={[
        styles.container,
        { backgroundColor, borderColor },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <Text variant="lg-400" style={[{ color: textColor }, textStyle]}>
          {children}
        </Text>
      )}
    </Button>
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
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
});
