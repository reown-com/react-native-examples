import { useTheme } from "@/hooks/use-theme-color";
import { memo, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

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

  const translateRef = useRef(new Animated.Value(0));
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!measuredWidth) {
      return undefined;
    }
    const translateX = translateRef.current;
    translateX.setValue(0);
    const timing = Animated.timing(translateX, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    });
    const loop = Animated.loop(timing);
    loopRef.current = loop;

    loop.start();

    return () => {
      loop.stop();
      if (loopRef.current === loop) {
        loopRef.current = null;
      }
      translateX.stopAnimation(() => {
        translateX.setValue(0);
      });
    };
  }, [duration, measuredWidth]);

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
  let animatedTranslateX: any = 0;
  let bandWidth = 0;
  if (measuredWidth) {
    bandWidth = Math.max(8, measuredWidth * highlightWidthRatio);
    const travel = measuredWidth + bandWidth * 2;
    animatedTranslateX = translateRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: [-bandWidth, travel - bandWidth],
    });
  }

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
          style={[
            bandStyle,
            {
              transform: [
                { translateX: animatedTranslateX },
                { rotate: `${angle}deg` },
              ],
            },
          ]}
        />
      ) : null}
    </View>
  );
}

export const Shimmer = memo(Shimmer_, () => {
  return true;
});
