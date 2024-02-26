import {StyleSheet, View, ViewStyle} from 'react-native';

import {useTheme} from '@/hooks/useTheme';

type SubscriptionItemSkeletonProps = {
  style?: ViewStyle;
};

export default function SubscriptionItemSkeleton({
  style,
}: SubscriptionItemSkeletonProps) {
  const Theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[styles.firstView, {backgroundColor: Theme['gray-glass-010']}]}
      />
      <View
        style={[styles.secondView, {backgroundColor: Theme['gray-glass-010']}]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    opacity: 0.8,
    gap: 8,
    padding: 12,
  },
  firstView: {
    width: '50%',
    height: 16,
    borderRadius: 4,
  },
  secondView: {
    width: '70%',
    height: 12,
    borderRadius: 4,
  },
});
