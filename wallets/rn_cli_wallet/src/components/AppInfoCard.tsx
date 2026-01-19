import { StyleSheet, View } from 'react-native';

import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface AppInfoCardProps {
  url?: string;
  validation?: 'UNKNOWN' | 'VALID' | 'INVALID';
  isScam?: boolean;
}

export function AppInfoCard({ url, validation, isScam }: AppInfoCardProps) {
  const Theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: Theme['foreground-primary'] }]}
    >
      <Text
        variant="lg-400"
        color="text-tertiary"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.url}
      >
        {url?.replace(/^https?:\/\//, '') || 'unknown domain'}
      </Text>
      <VerifiedBadge validation={validation} isScam={isScam} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius[4],
  },
  url: {
    flex: 1,
    marginRight: Spacing[2],
  },
});
