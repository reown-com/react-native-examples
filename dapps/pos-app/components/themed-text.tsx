import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  fontSize?: number;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  fontSize,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text-primary",
  );

  return (
    <Text
      style={[
        { color },
        styles.default,
        fontSize ? { fontSize } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "KH Teka",
  },
});
