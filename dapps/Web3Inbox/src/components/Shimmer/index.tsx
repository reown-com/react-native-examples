import {Svg, Rect} from 'react-native-svg';
import {Animated, type StyleProp, type ViewStyle} from 'react-native';
import useTheme from '@/hooks/useTheme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export interface ShimmerProps {
  width?: number;
  height?: number;
  duration?: number;
  borderRadius?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const Shimmer = ({
  width = 200,
  height = 200,
  duration = 1000,
  borderRadius = 0,
  backgroundColor,
  foregroundColor,
  style,
}: ShimmerProps) => {
  const animatedValue = new Animated.Value(0);
  const Theme = useTheme();

  const animatedProps = {
    fill: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        backgroundColor ?? Theme['bg-200'],
        foregroundColor ?? Theme['bg-300'],
        backgroundColor ?? Theme['bg-200'],
      ],
    }),
    width,
    height,
    x: 0,
    y: 0,
    rx: borderRadius,
    ry: borderRadius,
  };

  Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }),
  ).start();

  return (
    <Svg width={width} height={height} style={style}>
      <AnimatedRect {...animatedProps} />
    </Svg>
  );
};
