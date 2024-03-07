import {useEffect, useRef, type ReactNode} from 'react';
import {Animated, Easing, View} from 'react-native';
import Svg, {Rect} from 'react-native-svg';
import useTheme from '@/hooks/useTheme';
import {BorderRadius, Spacing} from '@/utils/ThemeUtil';
import styles from './styles';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export interface LoadingThumbnailProps {
  children?: ReactNode;
  paused?: boolean;
  borderRadius?: number;
}

export function LoadingThumbnail({
  children,
  paused,
  borderRadius = BorderRadius.l,
}: LoadingThumbnailProps) {
  const Theme = useTheme();
  const spinValue = useRef(new Animated.Value(0));
  const strokeWidth = 4;
  const rectangleSize = 80 + Spacing.l;
  const outerContainerSize = rectangleSize + strokeWidth;

  useEffect(() => {
    const animation = Animated.timing(spinValue.current, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.linear,
    });

    const loop = Animated.loop(animation);
    loop.start();

    return () => {
      loop.stop();
    };
  }, [spinValue]);

  // Calculate one side of the Rectangle with borders
  const sideLength =
    rectangleSize - borderRadius * 2 + (Math.PI * borderRadius) / 2;

  const spin = spinValue.current.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -sideLength * 4],
  });

  return (
    <View
      style={[
        styles.container,
        {height: outerContainerSize, width: outerContainerSize},
      ]}>
      <Svg
        width={outerContainerSize}
        height={outerContainerSize}
        style={styles.loader}>
        <AnimatedRect
          height={rectangleSize}
          width={rectangleSize}
          stroke={paused ? 'transparent' : Theme['accent-100']}
          strokeWidth={strokeWidth}
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          rx={borderRadius}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${sideLength} ${sideLength * 3}`}
          strokeDashoffset={spin}
        />
      </Svg>
      {children ?? null}
    </View>
  );
}
