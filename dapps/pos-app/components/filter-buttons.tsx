import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Pressable } from "./pressable";
import { ThemedText } from "./themed-text";

export interface FilterButtonConfig {
  label: string;
  onPress: () => void;
}

interface FilterButtonsProps {
  buttons: FilterButtonConfig[];
}

function FilterButtonsBase({ buttons }: FilterButtonsProps) {
  const theme = useTheme();
  const [assets] = useAssets([require("@/assets/images/caret-up-down.png")]);

  return (
    <View style={styles.container}>
      {buttons.map((button, index) => (
        <Pressable
          key={`${button.label}-${index}`}
          onPress={button.onPress}
          style={[
            styles.button,
            { backgroundColor: theme["foreground-primary-fix"] },
          ]}
        >
          <ThemedText fontSize={16} lineHeight={18} color="text-primary">
            {button.label}
          </ThemedText>
          {assets?.[0] && (
            <Image
              source={assets[0]}
              style={[styles.caretIcon, { tintColor: theme["text-primary"] }]}
              tintColor={theme["text-primary"]}
              cachePolicy="memory-disk"
            />
          )}
        </Pressable>
      ))}
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
