import { StyleSheet, Text, type TextProps } from "react-native";

import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  fontSize?: number;
  lineHeight?: number;
  color?: keyof typeof Colors.light;
};

export function ThemedText({
  style,
  fontSize,
  lineHeight,
  color,
  ...rest
}: ThemedTextProps) {
  const _color = useThemeColor(color ?? "text-primary");

  return (
    <Text
      style={[
        { color: _color },
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
  default: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: "KH Teka",
  },
});
