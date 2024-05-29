import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useTheme} from '@/hooks/useTheme';

export interface ActionButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  secondary?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function ActionButton({
  onPress,
  children,
  secondary = false,
  loading,
  disabled,
  style,
  textStyle,
}: ActionButtonProps) {
  const Theme = useTheme();
  const backgroundColor = secondary ? Theme['bg-200'] : Theme['accent-100'];
  const textColor = secondary ? Theme['fg-100'] : Theme['inverse-100'];
  const loaderColor = secondary ? Theme['fg-100'] : Theme['inverse-100'];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.container, {backgroundColor}, style]}>
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <Text style={[styles.text, {color: textColor}, textStyle]}>
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
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 40,
    width: 100,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
