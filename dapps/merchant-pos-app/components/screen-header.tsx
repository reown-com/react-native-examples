import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ThemedText } from "./themed-text";

interface Props {
  /** Back handler; omit to hide the back button. */
  onBack?: () => void;
  /** Centered title. */
  title?: string;
  /** Right-aligned step label (e.g. "1 of 5"). */
  step?: string;
  /** Right-aligned custom node (takes precedence over `step`). */
  right?: React.ReactNode;
}

export function ScreenHeader({ onBack, title, step, right }: Props) {
  const Theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={8} style={styles.back}>
            <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
              <Path
                d="M12.5 15l-5-5 5-5"
                stroke={Theme["icon-accent-primary"]}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <ThemedText color="text-accent-primary" style={styles.backText}>
              Back
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      {title ? (
        <ThemedText weight="500" style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
      ) : null}

      <View style={[styles.side, styles.sideRight]}>
        {right ??
          (step ? (
            <ThemedText color="text-secondary" style={styles.step}>
              {step}
            </ThemedText>
          ) : null)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing["spacing-5"],
  },
  side: {
    minWidth: 72,
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
  },
  step: {
    fontSize: 13,
  },
});
