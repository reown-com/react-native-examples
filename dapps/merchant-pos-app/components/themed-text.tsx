import { StyleSheet, Text, type TextProps } from "react-native";

import { ColorName } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  fontSize?: number;
  lineHeight?: number;
  weight?: "300" | "400" | "500";
  color?: ColorName;
};

const FONT_BY_WEIGHT: Record<string, string> = {
  "300": "KH Teka Light",
  "400": "KH Teka",
  "500": "KH Teka Medium",
};

export function ThemedText({
  style,
  fontSize,
  lineHeight,
  weight = "400",
  color,
  ...rest
}: ThemedTextProps) {
  const _color = useThemeColor(color ?? "text-primary");

  return (
    <Text
      style={[
        { color: _color, fontFamily: FONT_BY_WEIGHT[weight] },
        styles.default,
        fontSize ? { fontSize } : undefined,
        lineHeight ? { lineHeight } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // No lineHeight/fontFamily here: lineHeight is left to scale naturally with
  // fontSize (avoids clipping large text), and the weight-based fontFamily set
  // above must not be overridden.
  default: {
    fontSize: 16,
  },
});
