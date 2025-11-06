import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { QRCodeUtil } from "@/utils/qr-code-generator";
import { memo, useMemo } from "react";
import {
  ImageSourcePropType,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";
import { Shimmer } from "./shimmer";

export interface QrCodeProps {
  size: number;
  uri?: string;
  imageSrc?: ImageSourcePropType;
  testID?: string;
  arenaClear?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  logoSize?: number;
  logoBorderRadius?: number;
}

function QrCode_({
  size,
  uri,
  testID,
  arenaClear,
  style,
  children,
  logoSize,
  logoBorderRadius,
}: QrCodeProps) {
  const Theme = useTheme("light");
  const containerPadding = Spacing["spacing-3"];
  const qrSize = size - containerPadding * 2;
  const _logoSize = arenaClear ? 0 : (logoSize ?? qrSize / 4);

  const dotColor = Theme["bg-invert"];
  const edgeColor = Theme["bg-primary"];

  const qrData = useMemo(
    () =>
      uri
        ? QRCodeUtil.generate(uri, qrSize, _logoSize, logoBorderRadius)
        : null,
    [uri, qrSize, _logoSize, logoBorderRadius],
  );

  if (!uri || !qrData) {
    return (
      <Shimmer width={size} height={size} borderRadius={BorderRadius["5"]} />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          backgroundColor: Theme["bg-primary"],
          padding: containerPadding,
        },
        style,
      ]}
      testID={testID}
    >
      <Svg height={qrSize} width={qrSize}>
        {/* Render rectangles */}
        {qrData.rects.map((rect) => (
          <Rect
            key={`rect_${rect.x}_${rect.y}`}
            fill={rect.fillType === "dot" ? dotColor : edgeColor}
            height={rect.size}
            rx={rect.size * 0.32}
            ry={rect.size * 0.32}
            width={rect.size}
            x={rect.x}
            y={rect.y}
          />
        ))}

        {/* Render circles */}
        {qrData.circles.map((circle) => (
          <Circle
            key={`circle_${circle.cx}_${circle.cy}`}
            cx={circle.cx}
            cy={circle.cy}
            fill={dotColor}
            r={circle.r}
          />
        ))}

        {/* Render lines */}
        {qrData.lines.map((line) => (
          <Line
            key={`line_${line.x1}_${line.y1}_${line.y2}`}
            x1={line.x1}
            x2={line.x2}
            y1={line.y1}
            y2={line.y2}
            stroke={dotColor}
            strokeWidth={line.strokeWidth}
            strokeLinecap="round"
          />
        ))}
      </Svg>
      {!arenaClear && <View style={styles.icon}>{children}</View>}
    </View>
  );
}

export const QRCode = memo(QrCode_, (prevProps, nextProps) => {
  return (
    prevProps.size === nextProps.size &&
    prevProps.uri === nextProps.uri &&
    prevProps.style === nextProps.style &&
    prevProps.logoBorderRadius === nextProps.logoBorderRadius
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius["5"],
    alignSelf: "center",
  },
  icon: {
    position: "absolute",
  },
});
