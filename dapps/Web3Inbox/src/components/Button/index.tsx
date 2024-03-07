import useTheme from '@/hooks/useTheme';
import {ReactNode} from 'react';
import {
  ActivityIndicator,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import styles from './styles';

type Props = TouchableOpacityProps & {
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  rightIcon?: ReactNode;
  loading?: boolean;
};

function Button({
  onPress,
  label,
  style,
  labelStyle,
  rightIcon,
  loading,
  ...props
}: Props) {
  const Theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, {backgroundColor: Theme['accent-100']}, style]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={Theme['inverse-100']} size="small" />
      ) : (
        <>
          <Text
            style={[styles.label, {color: Theme['inverse-100']}, labelStyle]}>
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

export default Button;
