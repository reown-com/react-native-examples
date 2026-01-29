import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface VerifiedBadgeProps {
  validation?: 'UNKNOWN' | 'VALID' | 'INVALID';
  isScam?: boolean;
}

export function VerifiedBadge({ validation, isScam }: VerifiedBadgeProps) {
  const Theme = useTheme();

  const getBadgeConfig = () => {
    if (isScam) {
      return { label: 'Unsafe', bg: Theme['text-error'] };
    }
    if (validation === 'INVALID') {
      return { label: 'Mismatch', bg: Theme['text-warning'] };
    }
    if (validation === 'VALID') {
      return { label: 'Verified', bg: Theme['text-success'] };
    }
    // UNKNOWN or undefined
    return { label: 'Unverified', bg: Theme['foreground-tertiary'] };
  };

  const { label, bg } = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text variant="md-500" color="white">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius[2],
    paddingHorizontal: Spacing[2],
  },
});
