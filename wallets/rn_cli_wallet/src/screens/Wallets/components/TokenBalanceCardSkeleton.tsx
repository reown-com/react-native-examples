import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Shimmer } from '@/components/Shimmer';
import { ITEM_HEIGHT } from './TokenBalanceCard';

function TokenBalanceCardSkeleton_() {
  const Theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: Theme['foreground-primary'] }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.iconContainer}>
        <Shimmer width={38} height={38} borderRadius={BorderRadius.full} />
      </View>
      <View style={styles.cardContent}>
        <Shimmer width={96} height={20} borderRadius={BorderRadius[1]} />
        <Shimmer width={126} height={16} borderRadius={BorderRadius[1]} />
      </View>
      <View style={styles.copyButton}>
        <Shimmer width={20} height={20} borderRadius={BorderRadius[1]} />
      </View>
    </View>
  );
}

export const TokenBalanceCardSkeleton = React.memo(TokenBalanceCardSkeleton_);

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius[4],
    paddingHorizontal: Spacing[6],
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    marginRight: Spacing[3],
  },
  cardContent: {
    flex: 1,
    gap: Spacing['05'],
  },
  copyButton: {
    padding: Spacing[2],
  },
});
