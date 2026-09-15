import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";

interface TestModePillProps {
  style?: StyleProp<ViewStyle>;
}

export function TestModePill({ style }: TestModePillProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel="Test mode active. Payments are simulated."
      style={[
        styles.container,
        { backgroundColor: theme["foreground-accent-primary-60"] },
        style,
      ]}
    >
      <ThemedText
        fontSize={14}
        lineHeight={18}
        style={{
          color: theme["text-primary"],
          fontFamily: "KH Teka Medium",
          fontWeight: "500",
        }}
      >
        Test mode
      </ThemedText>
    </View>
  );
}

interface TestModeOverlayProps {
  // Vertical space reserved below the floating pill so screen content isn't
  // hidden underneath it. The pill's on-screen position is fixed by `top` and
  // is unaffected by this value.
  spacerHeight?: number;
}

export function TestModeOverlay({
  spacerHeight = Spacing["spacing-8"],
}: TestModeOverlayProps) {
  return (
    <>
      <View style={styles.overlay}>
        <TestModePill />
      </View>
      <View style={{ height: spacerHeight }} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["spacing-3"],
    paddingVertical: Spacing["spacing-1"],
    borderRadius: 999,
  },
  overlay: {
    position: "absolute",
    top: Spacing["spacing-3"],
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
});
