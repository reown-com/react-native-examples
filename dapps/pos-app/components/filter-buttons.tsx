import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "./button";
import { ThemedText } from "./themed-text";

interface FilterButtonsProps {
  statusLabel: string;
  dateRangeLabel: string;
  onStatusPress: () => void;
  onDateRangePress: () => void;
}

function FilterButtonsBase({
  statusLabel,
  dateRangeLabel,
  onStatusPress,
  onDateRangePress,
}: FilterButtonsProps) {
  const theme = useTheme();
  const [assets] = useAssets([require("@/assets/images/caret-up-down.png")]);

  return (
    <View style={styles.container}>
      <Button
        onPress={onStatusPress}
        style={[
          styles.button,
          { backgroundColor: theme["foreground-primary"] },
        ]}
      >
        <ThemedText fontSize={16} lineHeight={18} color="text-primary">
          {statusLabel}
        </ThemedText>
        {assets?.[0] && (
          <Image
            source={assets[0]}
            style={[styles.caretIcon, { tintColor: theme["text-primary"] }]}
            tintColor={theme["text-primary"]}
            cachePolicy="memory-disk"
          />
        )}
      </Button>
      <Button
        onPress={onDateRangePress}
        style={[
          styles.button,
          { backgroundColor: theme["foreground-primary"] },
        ]}
      >
        <ThemedText fontSize={16} lineHeight={18} color="text-primary">
          {dateRangeLabel}
        </ThemedText>
        {assets?.[0] && (
          <Image
            source={assets[0]}
            style={[styles.caretIcon, { tintColor: theme["text-primary"] }]}
            tintColor={theme["text-primary"]}
            cachePolicy="memory-disk"
          />
        )}
      </Button>
    </View>
  );
}

export const FilterButtons = memo(FilterButtonsBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing["spacing-2"],
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-1"],
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-4"],
    borderRadius: BorderRadius["4"],
    gap: Spacing["spacing-2"],
  },
  caretIcon: {
    width: 16,
    height: 16,
  },
});
