import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { Button } from "./button";
import { ThemedText } from "./themed-text";

interface SettingsItemProps {
  title: string;
  value?: string;
  onPress: () => void;
  showCaret?: boolean;
  disabled?: boolean;
}

export function SettingsItem({
  title,
  value,
  onPress,
  showCaret,
  disabled,
}: SettingsItemProps) {
  const Theme = useTheme();
  const [assets] = useAssets([require("@/assets/images/caret-up-down.png")]);
  const shouldShowCaret = showCaret ?? !!value;

  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        { backgroundColor: Theme["foreground-primary"] },
        disabled && { opacity: 0.4 },
      ]}
    >
      <View style={styles.labelRow}>
        <ThemedText fontSize={16} lineHeight={18} color="text-primary">
          {title}
        </ThemedText>
        {value && (
          <ThemedText
            fontSize={16}
            lineHeight={18}
            color="text-tertiary"
            numberOfLines={1}
            style={styles.value}
          >
            {value}
          </ThemedText>
        )}
      </View>
      {shouldShowCaret && assets?.[0] && (
        <Image
          source={assets[0]}
          style={[styles.caretIcon, { tintColor: Theme["text-primary"] }]}
          tintColor={Theme["text-primary"]}
          cachePolicy="memory-disk"
        />
      )}
    </Button>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 68,
    paddingHorizontal: Spacing["spacing-5"],
    borderRadius: BorderRadius["4"],
    gap: Spacing["spacing-2"],
  },
  labelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
  },
  value: {
    flex: 1,
  },
  caretIcon: {
    width: 20,
    height: 20,
  },
});
