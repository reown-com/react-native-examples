import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { Pressable } from "./pressable";
import { ThemedText } from "./themed-text";

interface LogEntriesRowProps {
  count: number;
  onPress: () => void;
  testID?: string;
}

export function LogEntriesRow({ count, onPress, testID }: LogEntriesRowProps) {
  const Theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: Theme["foreground-primary-fix"] },
      ]}
    >
      <ThemedText
        fontSize={16}
        lineHeight={18}
        color="text-primary"
        style={styles.title}
      >
        {`${count} Log ${count === 1 ? "entry" : "entries"}`}
      </ThemedText>
      <View style={[styles.pill, { backgroundColor: Theme["bg-invert"] }]}>
        <ThemedText fontSize={12} lineHeight={14} color="text-invert">
          View Logs
        </ThemedText>
        <Image
          source={require("@/assets/images/chevron-right.png")}
          style={[styles.chevron, { tintColor: Theme["text-invert"] }]}
          tintColor={Theme["text-invert"]}
          cachePolicy="memory-disk"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    paddingHorizontal: Spacing["spacing-5"],
    borderRadius: BorderRadius["4"],
    gap: Spacing["spacing-2"],
  },
  title: {
    fontWeight: "500",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-1"],
    height: 28,
    paddingHorizontal: Spacing["spacing-3"],
    borderRadius: BorderRadius["3"],
  },
  chevron: {
    width: 12,
    height: 12,
  },
});
