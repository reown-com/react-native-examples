import { Canvas, Circle, Path, Skia } from "@shopify/react-native-skia";
import { memo } from "react";

interface Props {
  size?: number;
  background?: string;
  foreground?: string;
}

function NfcTapIcon_({
  size = 56,
  background = "#0988F0",
  foreground = "#FFFFFF",
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const badgeRadius = size / 2;

  // Place the dot roughly at the left-third and radiate arcs to the right.
  const dotX = size * 0.36;
  const dotY = cy;
  const dotRadius = size * 0.06;
  const strokeWidth = size * 0.08;

  const arcPath = (arcRadius: number) => {
    const path = Skia.Path.Make();
    const rect = {
      x: dotX - arcRadius,
      y: dotY - arcRadius,
      width: arcRadius * 2,
      height: arcRadius * 2,
    };
    // Open on the right side: from -45° to +45° around the dot.
    path.addArc(rect, -45, 90);
    return path;
  };

  return (
    <Canvas style={{ width: size, height: size }}>
      <Circle cx={cx} cy={cy} r={badgeRadius} color={background} />
      <Circle cx={dotX} cy={dotY} r={dotRadius} color={foreground} />
      <Path
        path={arcPath(size * 0.16)}
        color={foreground}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
      />
      <Path
        path={arcPath(size * 0.26)}
        color={foreground}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
      />
      <Path
        path={arcPath(size * 0.36)}
        color={foreground}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
      />
    </Canvas>
  );
}

export const NfcTapIcon = memo(NfcTapIcon_);
