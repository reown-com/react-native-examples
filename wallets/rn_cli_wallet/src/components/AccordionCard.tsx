import { ReactNode, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import SvgCaretUpDown from '@/assets/CaretUpDown';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Button } from '@/components/Button';

const ANIMATION_DURATION = 250;

interface AccordionCardProps {
  headerContent: ReactNode;
  rightContent?: ReactNode;
  children: ReactNode;
  isExpanded: boolean;
  onPress: () => void;
  /** Omit to size the expanded card to its content. */
  expandedHeight?: number;
  hideExpand?: boolean;
}

export function AccordionCard({
  headerContent,
  rightContent,
  children,
  isExpanded,
  onPress,
  expandedHeight,
  hideExpand,
}: AccordionCardProps) {
  const Theme = useTheme();
  const heightValue = useSharedValue(0);
  const [contentHeight, setContentHeight] = useState(0);
  const isAutoHeight = expandedHeight == null;
  const targetHeight = expandedHeight ?? contentHeight;

  useEffect(() => {
    heightValue.value = withTiming(isExpanded ? targetHeight : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isExpanded, targetHeight, heightValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
    opacity: heightValue.value > 0 ? 1 : 0,
    overflow: 'hidden',
  }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Theme['foreground-primary'] },
      ]}
    >
      <Button style={styles.header} onPress={onPress} disabled={hideExpand}>
        <View style={styles.headerLeft}>{headerContent}</View>
        <View style={styles.headerRight}>
          {rightContent}
          {!hideExpand && (
            <SvgCaretUpDown
              width={17}
              height={17}
              fill={Theme['icon-invert']}
            />
          )}
        </View>
      </Button>
      <Animated.View style={animatedStyle}>
        {/* Auto height: absolutely positioned so the clipped (animating)
            parent doesn't cap the measured height. */}
        <View
          style={[styles.content, isAutoHeight && styles.autoHeightContent]}
          onLayout={
            isAutoHeight
              ? e => setContentHeight(e.nativeEvent.layout.height)
              : undefined
          }
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius[4],
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[5],
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[5],
  },
  autoHeightContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
