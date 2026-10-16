import { ColorName } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  color?: ColorName;
};

export function ThemedView({
  style,
  color = "bg-primary",
  ...rest
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(color);
  return <View style={[{ backgroundColor }, style]} {...rest} />;
}
