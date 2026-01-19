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

type ButtonType = 'accent' | 'secondary';
type ButtonVariant = 'primary' | 'secondary';

export interface ActionButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  /** @deprecated Use `buttonType` and `variant` instead */
  secondary?: boolean;
  /** Button type: 'accent' (blue) or 'secondary' (gray/white) */
  buttonType?: ButtonType;
  /** Button variant: 'primary' (filled) or 'secondary' (outlined) */
  variant?: ButtonVariant;
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
  buttonType,
  variant,
  loading,
  disabled,
  fullWidth = false,
  style,
  textStyle,
}: ActionButtonProps) {
  const Theme = useTheme();

  // Support legacy `secondary` prop while allowing new buttonType/variant
  const resolvedType: ButtonType = buttonType ?? (secondary ? 'secondary' : 'accent');
  const resolvedVariant: ButtonVariant = variant ?? (secondary ? 'secondary' : 'primary');

  const getButtonStyles = () => {
    const isAccent = resolvedType === 'accent';
    const isPrimary = resolvedVariant === 'primary';

    if (isAccent && isPrimary) {
      // Accent/Primary: Blue filled button
      return {
        backgroundColor: disabled
          ? Theme['foreground-accent-primary-60']
          : Theme['bg-accent-primary'],
        textColor: Theme['text-invert'],
        borderColor: disabled
          ? Theme['foreground-accent-primary-60']
          : Theme['bg-accent-primary'],
      };
    }

    if (isAccent && !isPrimary) {
      // Accent/Secondary: Blue outline button
      return {
        backgroundColor: disabled
          ? Theme['foreground-accent-primary-10']
          : Theme['bg-primary'],
        textColor: disabled
          ? Theme['foreground-accent-primary-60']
          : Theme['text-accent-primary'],
        borderColor: disabled
          ? Theme['foreground-accent-primary-40']
          : Theme['border-accent-primary'],
      };
    }

    if (!isAccent && isPrimary) {
      // Secondary/Primary: Gray filled button
      return {
        backgroundColor: disabled
          ? Theme['foreground-tertiary']
          : Theme['foreground-secondary'],
        textColor: disabled ? Theme['text-secondary'] : Theme['text-primary'],
        borderColor: disabled
          ? Theme['foreground-tertiary']
          : Theme['foreground-secondary'],
      };
    }

    // Secondary/Secondary: White with gray border (outline button)
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
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
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
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
});
