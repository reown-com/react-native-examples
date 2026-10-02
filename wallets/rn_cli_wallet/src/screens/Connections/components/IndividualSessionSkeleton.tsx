// TODO: wire in once the Sessions view gains a loading state; kept here so
// the placeholder stays in sync with IndividualSession's layout.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Shimmer } from '@/components/Shimmer';

function IndividualSessionSkeleton_() {
  const Theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Theme['foreground-primary'] },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.flexRow}>
        <Shimmer width={48} height={48} borderRadius={BorderRadius[3]} />
        <View style={styles.textContainer}>
          <Shimmer width={140} height={20} borderRadius={BorderRadius[1]} />
          <Shimmer width={96} height={14} borderRadius={BorderRadius[1]} />
        </View>
        <View style={styles.chainIcons}>
          <Shimmer width={24} height={24} borderRadius={BorderRadius.full} />
          <Shimmer width={24} height={24} borderRadius={BorderRadius.full} />
        </View>
      </View>
    </View>
  );
}

export const IndividualSessionSkeleton = React.memo(IndividualSessionSkeleton_);

const styles = StyleSheet.create({
  container: {
    padding: Spacing[5],
    borderRadius: BorderRadius[4],
    marginBottom: Spacing[2],
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    paddingLeft: Spacing[3],
    marginRight: Spacing[2],
    flex: 1,
    gap: Spacing[2],
  },
  chainIcons: {
    flexDirection: 'row',
    gap: Spacing['05'],
  },
});
