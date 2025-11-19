import { BorderRadius, Spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/use-theme-color';
import { CustomPressableProps, PressableScale } from 'pressto';
import React from 'react';
import { StyleSheet } from 'react-native';

import { Text } from '@/components/primitives/text';
export type ButtonProps = CustomPressableProps & {
  type?: 'primary' | 'secondary' | 'none';
  text?: string;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  style,
  type = 'none',
  text,
  onPress,
  ...props
}) => {
  const Theme = useTheme();
  const isPrimary = type === 'primary';
  const isSecondary = type === 'secondary';
  const backgroundColor = Theme[isPrimary ? 'bg-accent-primary' : 'bg-primary'];
  const borderColor = isPrimary ? 'transparent' : Theme['border-secondary'];
  const textColor = isPrimary ? 'white' : 'text-primary';

  return (
    <PressableScale
      {...props}
      style={[
        styles.button,
        { backgroundColor, borderColor },
        isSecondary && styles.buttonSecondary,
        text && styles.textContainer,
        style,
      ]}
      onPress={onPress}>
      {text ? (
        <Text fontSize={16} lineHeight={28} color={textColor}>
          {text}
        </Text>
      ) : (
        children
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius['4'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    borderWidth: 1,
  },
  textContainer: {
    paddingVertical: Spacing['spacing-3'],
    paddingHorizontal: Spacing['spacing-5'],
  },
});
