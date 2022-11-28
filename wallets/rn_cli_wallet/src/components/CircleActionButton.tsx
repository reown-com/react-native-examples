import {ReactNode} from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';

import {useTheme} from '@/hooks/useTheme';

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
      style={[styles.container, {backgroundColor: Theme['accent-100']}]}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    width: 56,
  },
  imageContainer: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});
