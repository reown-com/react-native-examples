import { useTheme } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";

/** Thin onboarding progress bar. `step` is 1-based, `total` the number of steps. */
export function ProgressBar({ step, total }: { step: number; total: number }) {
  const Theme = useTheme();
  const pct = Math.max(0, Math.min(1, step / total));
  return (
    <View
      style={[styles.track, { backgroundColor: Theme["foreground-secondary"] }]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${pct * 100}%`,
            backgroundColor: Theme["bg-accent-primary"],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    height: 3,
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
  },
});
