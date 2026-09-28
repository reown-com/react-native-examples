import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ThemedText } from "./themed-text";

interface Props {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}

/** Selectable checkbox row used on the settlement-networks screen. */
export function OptionRow({ title, subtitle, icon, selected, onPress }: Props) {
  const Theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: selected
            ? Theme["surface-accent"]
            : Theme["foreground-primary"],
          borderColor: selected
            ? Theme["border-accent-primary"]
            : Theme["border-primary"],
        },
      ]}
    >
      <View style={styles.left}>
        <View style={styles.icon}>{icon}</View>
        <View>
          <ThemedText weight="500" style={styles.title}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText color="text-secondary" style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: selected
              ? Theme["bg-accent-primary"]
              : "transparent",
            borderColor: selected
              ? Theme["bg-accent-primary"]
              : Theme["border-secondary"],
          },
        ]}
      >
        {selected ? (
          <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <Path
              d="M2.5 7l3.5 3.5 6-6"
              stroke="#fff"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: BorderRadius["5"],
    borderWidth: 1.5,
    paddingVertical: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-5"],
    marginBottom: Spacing["spacing-3"],
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-4"],
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
