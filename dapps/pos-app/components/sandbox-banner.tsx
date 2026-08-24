import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";

interface SandboxBannerProps {
  style?: StyleProp<ViewStyle>;
}

export function SandboxBanner({ style }: SandboxBannerProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme["bg-warning"] },
        style,
      ]}
    >
      <ThemedText
        fontSize={14}
        lineHeight={18}
        style={{ color: theme["text-primary"] }}
      >
        Sandbox mode · Payments are simulated
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-4"],
    paddingVertical: Spacing["spacing-2"],
    borderRadius: BorderRadius["4"],
  },
});
