import {StyleSheet, View} from 'react-native';
import {Shimmer} from './Shimmer';
import {Spacing} from '@/utils/ThemeUtil';

export default function SubscriptionItemSkeleton() {
  return (
    <View style={styles.container}>
      <Shimmer height={48} width={48} borderRadius={32} />
      <View style={styles.textContainer}>
        <Shimmer height={16} width={80} borderRadius={4} />
        <Shimmer height={16} width={150} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    padding: Spacing.s,
  },
  textContainer: {
    rowGap: 4,
  },
});
