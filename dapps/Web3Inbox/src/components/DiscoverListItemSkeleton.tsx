import {StyleSheet, View} from 'react-native';

import useTheme from '@/hooks/useTheme';
import {Shimmer} from '@/components/Shimmer';
import {Spacing} from '@/utils/ThemeUtil';

export default function DiscoverListItemSkeleton() {
  const Theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Theme['bg-100'],
          borderColor: Theme['gray-glass-010'],
        },
      ]}>
      <View style={styles.header}>
        <Shimmer width={48} height={48} borderRadius={32} />
        <Shimmer width={90} height={36} borderRadius={18} />
      </View>
      <View style={styles.bodyContainer}>
        <Shimmer width={100} height={20} borderRadius={4} />
        <Shimmer
          width={140}
          height={8}
          borderRadius={1}
          style={styles.nameLoader}
        />
        <Shimmer width={240} height={12} borderRadius={3} />
        <Shimmer width={220} height={12} borderRadius={3} />
        <Shimmer width={220} height={12} borderRadius={3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    rowGap: Spacing.s,
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameLoader: {
    marginBottom: Spacing.xs,
  },
  bodyContainer: {
    rowGap: Spacing['3xs'],
  },
});
