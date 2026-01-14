import { useTheme } from "@/hooks/use-theme-color";
import { memo, useEffect, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type PercentString = `${number}%`;
type ShimmerDimension = number | PercentString;

export interface ShimmerProps {
  width?: ShimmerDimension;
  height?: ShimmerDimension;
  duration?: number;
  borderRadius?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  highlightWidthRatio?: number;
  highlightOpacity?: number;
  angle?: number; // in degrees
  style?: StyleProp<ViewStyle>;
}

function Shimmer_({
  width = 200,
  height = 200,
  duration = 1000,
  borderRadius = 0,
  backgroundColor,
  foregroundColor,
  highlightWidthRatio = 0.3,
  highlightOpacity = 0.5,
  angle = 20,
  style,
}: ShimmerProps) {
  const Theme = useTheme();

  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  const translateX = useSharedValue(0);

  useEffect(() => {
    if (!measuredWidth) {
      return undefined;
    }
    translateX.value = 0;
    translateX.value = withRepeat(withTiming(1, { duration }), -1, false);
  }, [duration, measuredWidth, translateX]);

  const baseColor = backgroundColor ?? Theme["foreground-secondary"];
  const highlightColor = foregroundColor ?? Theme["foreground-tertiary"];

  const onLayout = (event: any) => {
    const { width: w, height: h } = event.nativeEvent.layout;
    // Update measurements whenever they change to adapt to dynamic layout/orientation
    if (measuredWidth == null || Math.abs(w - measuredWidth) > 0.5) {
      setMeasuredWidth(w);
    }
    if (measuredHeight == null || Math.abs(h - measuredHeight) > 0.5) {
      setMeasuredHeight(h);
    }
  };

  // Compute animated translateX only if we have width
  const bandWidth = measuredWidth
    ? Math.max(8, measuredWidth * highlightWidthRatio)
    : 0;
  const travel = measuredWidth ? measuredWidth + bandWidth * 2 : 0;

  const animatedStyle = useAnimatedStyle(() => {
    if (!measuredWidth) {
      return {};
    }
    const translateXValue = interpolate(
      translateX.value,
      [0, 1],
      [-bandWidth, travel - bandWidth],
    );
    return {
      transform: [{ translateX: translateXValue }, { rotate: `${angle}deg` }],
    };
  });

  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Theme["border-primary"],
    backgroundColor: baseColor,
  };

  const bandStyle: ViewStyle = {
    position: "absolute",
    top: measuredHeight ? -measuredHeight * 0.25 : 0,
    bottom: measuredHeight ? -measuredHeight * 0.25 : 0,
    width: bandWidth,
    backgroundColor: highlightColor,
    opacity: highlightOpacity,
  };

  return (
    <View onLayout={onLayout} style={[containerStyle, style]}>
      {measuredWidth && measuredHeight ? (
        <Animated.View
          pointerEvents="none"
          style={[bandStyle, animatedStyle]}
        />
      ) : null}
    </View>
  );
}

export const Shimmer = memo(Shimmer_, () => {
  return true;
});
