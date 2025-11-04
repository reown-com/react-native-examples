import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { generateQRDataAsync, type QRData } from "@/utils/qr-code-generator";
import { memo, useEffect, useState } from "react";
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
}

function QrCode_({
  size,
  uri,
  testID,
  arenaClear,
  style,
  children,
}: QrCodeProps) {
  const Theme = useTheme("light");
  const logoSize = arenaClear ? 0 : size / 4;
  const padding = Spacing["spacing-3"];

  const [qrData, setQrData] = useState<QRData | null>(null);

  const dotColor = Theme["bg-invert"];
  const edgeColor = Theme["bg-primary"];

  useEffect(() => {
    if (!uri) {
      setQrData(null);
      return;
    }

    let cancelled = false;

    // Run QR generation asynchronously
    generateQRDataAsync(uri, size, logoSize)
      .then((data) => {
        if (!cancelled) {
          setQrData(data);
        }
      })
      .catch((error) => {
        console.error("Failed to generate QR code:", error);
        if (!cancelled) {
          setQrData(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [uri, size, logoSize]);

  if (!uri || !qrData) {
    return (
      <Shimmer
        width={size + padding * 2}
        height={size + padding * 2}
        borderRadius={BorderRadius["5"]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Theme["bg-primary"],
        },
        style,
      ]}
      testID={testID}
    >
      <Svg height={size} width={size}>
        {/* Render rectangles */}
        {qrData.rects.map((rect, idx) => (
          <Rect
            key={`rect_${idx}`}
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
        {qrData.circles.map((circle, idx) => (
          <Circle
            key={`circle_${idx}`}
            cx={circle.cx}
            cy={circle.cy}
            fill={dotColor}
            r={circle.r}
          />
        ))}

        {/* Render lines */}
        {qrData.lines.map((line, idx) => (
          <Line
            key={`line_${idx}`}
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
    prevProps.style === nextProps.style
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius["5"],
    alignSelf: "center",
    padding: Spacing["spacing-3"],
  },
  icon: {
    position: "absolute",
  },
});
