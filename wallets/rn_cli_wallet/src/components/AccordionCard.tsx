import { ReactNode, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import SvgCaretUpDown from '@/assets/CaretUpDown';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

const ANIMATION_DURATION = 250;

interface AccordionCardProps {
  headerContent: ReactNode;
  rightContent?: ReactNode;
  children: ReactNode;
  isExpanded: boolean;
  onPress: () => void;
  expandedHeight: number;
}

export function AccordionCard({
  headerContent,
  rightContent,
  children,
  isExpanded,
  onPress,
  expandedHeight,
}: AccordionCardProps) {
  const Theme = useTheme();
  const heightValue = useSharedValue(0);

  useEffect(() => {
    heightValue.value = withTiming(isExpanded ? expandedHeight : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isExpanded, expandedHeight, heightValue]);

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
      <TouchableOpacity style={styles.header} onPress={onPress}>
        <View style={styles.headerLeft}>{headerContent}</View>
        <View style={styles.headerRight}>
          {rightContent}
          <SvgCaretUpDown width={17} height={17} fill={Theme['icon-invert']} />
        </View>
      </TouchableOpacity>
      <Animated.View style={animatedStyle}>
        <View style={styles.content}>{children}</View>
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
});
