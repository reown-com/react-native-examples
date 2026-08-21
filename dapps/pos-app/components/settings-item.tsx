import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useAssets } from "expo-asset";
import { Image, ImageSource } from "expo-image";
import { StyleSheet, View } from "react-native";
import { Pressable } from "./pressable";
import { ThemedText } from "./themed-text";

interface SettingsItemProps {
  title: string;
  value?: string;
  onPress: () => void;
  showCaret?: boolean;
  /**
   * Which caret to draw on the right. "up-down" (default) opens a picker sheet;
   * "right" drills into an editor.
   */
  caret?: "up-down" | "right";
  /** Optional leading icon rendered before the title (tinted to text-primary). */
  icon?: ImageSource;
  disabled?: boolean;
  testID?: string;
}

export function SettingsItem({
  title,
  value,
  onPress,
  showCaret,
  caret = "up-down",
  icon,
  disabled,
  testID,
}: SettingsItemProps) {
  const Theme = useTheme();
  const [assets] = useAssets([
    require("@/assets/images/caret-up-down.png"),
    require("@/assets/images/chevron-right.png"),
  ]);
  const shouldShowCaret = showCaret ?? !!value;
  const caretAsset = caret === "right" ? assets?.[1] : assets?.[0];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: Theme["foreground-primary-fix"] },
        disabled && { opacity: 0.4 },
      ]}
    >
      <View style={styles.labelRow}>
        {icon && (
          <Image
            source={icon}
            style={[styles.leadingIcon, { tintColor: Theme["text-primary"] }]}
            tintColor={Theme["text-primary"]}
            cachePolicy="memory-disk"
          />
        )}
        <ThemedText
          fontSize={16}
          lineHeight={18}
          color="text-primary"
          style={styles.title}
        >
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
      {shouldShowCaret && caretAsset && (
        <Image
          source={caretAsset}
          style={[styles.caretIcon, { tintColor: Theme["text-primary"] }]}
          tintColor={Theme["text-primary"]}
          cachePolicy="memory-disk"
        />
      )}
    </Pressable>
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
  title: {
    fontWeight: "500",
  },
  value: {
    flex: 1,
  },
  caretIcon: {
    width: 20,
    height: 20,
  },
  leadingIcon: {
    width: 16,
    height: 16,
  },
});
