import {Text as NativeText, type TextProps as NativeProps} from 'react-native';
import useTheme from '@/hooks/useTheme';
import type {ColorType, TextType} from '@/utils/TypesUtil';
import styles from './styles';

export type TextProps = NativeProps & {
  color?: ColorType;
  variant?: TextType;
  center?: boolean;
};

export function Text({
  children,
  style,
  center,
  color = 'fg-100',
  variant = 'paragraph-500',
  ...rest
}: TextProps) {
  const Theme = useTheme();

  return (
    <NativeText
      style={[
        styles.base,
        styles[variant],
        center && styles.center,
        color && {color: Theme[color as keyof typeof Theme]},
        style,
      ]}
      {...rest}>
      {children}
    </NativeText>
  );
}
