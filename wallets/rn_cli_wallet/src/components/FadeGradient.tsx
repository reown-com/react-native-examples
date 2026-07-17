import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';

import { useTheme } from '@/hooks/useTheme';

type Position = 'top' | 'bottom';

interface FadeGradientProps {
  position: Position;
  height?: number;
  style?: ViewStyle;
}

const DEFAULT_HEIGHT = 32;

export function FadeGradient({
  position,
  height = DEFAULT_HEIGHT,
  style,
}: FadeGradientProps) {
  const Theme = useTheme();
  const isTop = position === 'top';

  return (
    <View
      style={[
        styles.container,
        isTop ? styles.top : styles.bottom,
        { height },
        isTop && styles.aboveContent,
        style,
      ]}
      pointerEvents="none"
    >
      <Svg width="100%" height="100%">
        <Defs>
          <SvgLinearGradient
            id={`fade-${position}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <Stop
              offset="0"
              stopColor={Theme['bg-primary']}
              stopOpacity={isTop ? '1' : '0'}
            />
            <Stop
              offset="1"
              stopColor={Theme['bg-primary']}
              stopOpacity={isTop ? '0' : '1'}
            />
          </SvgLinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#fade-${position})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
  aboveContent: {
    zIndex: 1,
  },
});
