import {StyleSheet, View} from 'react-native';
import useTheme from '@/hooks/useTheme';
import {Shimmer} from '@/components/Shimmer';
import {Spacing} from '@/utils/ThemeUtil';

export default function NotificationItemSkeleton() {
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
      <Shimmer width={48} height={48} borderRadius={10} />
      <View style={styles.bodyContainer}>
        <View style={styles.title}>
          <Shimmer width={100} height={18} borderRadius={4} />
          <Shimmer width={40} height={18} borderRadius={4} />
        </View>
        <Shimmer width={240} height={10} borderRadius={3} />
        <Shimmer width={220} height={10} borderRadius={3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    rowGap: Spacing.s,
    padding: Spacing.l,
    flexDirection: 'row',
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameLoader: {
    marginBottom: Spacing.xs,
  },
  bodyContainer: {
    flex: 1,
    justifyContent: 'center',
    rowGap: Spacing['3xs'],
    marginLeft: Spacing.s,
  },
});
