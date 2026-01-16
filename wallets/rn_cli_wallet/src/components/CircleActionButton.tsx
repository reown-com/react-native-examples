import { ReactNode } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

interface CircleActionButtonProps {
  children: ReactNode;
  onPress: () => void;
}

export function CircleActionButton({
  children,
  onPress,
}: CircleActionButtonProps) {
  const Theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        { backgroundColor: Theme['bg-accent-primary'] },
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius[7],
    height: Spacing[12],
    width: Spacing[12],
  },
  imageContainer: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});
