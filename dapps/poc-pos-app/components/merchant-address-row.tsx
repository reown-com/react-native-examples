import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";

type MerchantAddressRowProps = {
  label: string;
  value?: string | null;
};

export const MerchantAddressRow = ({
  label,
  value,
}: MerchantAddressRowProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme["border-primary"],
          backgroundColor: theme["foreground-secondary"],
        },
      ]}
    >
      <View
        style={[
          styles.badge,
          {
            backgroundColor: theme["bg-accent-primary"],
          },
        ]}
      >
        <ThemedText
          fontSize={12}
          lineHeight={14}
          color="text-white"
          style={styles.badgeLabel}
        >
          {label}
        </ThemedText>
      </View>

      <ThemedText
        fontSize={14}
        lineHeight={16}
        style={styles.value}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {value ?? "N/A"}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing["spacing-3"],
    paddingVertical: Spacing["spacing-2"],
    borderWidth: 1,
    borderRadius: BorderRadius["3"],
    gap: Spacing["spacing-3"],
  },
  badge: {
    borderRadius: BorderRadius["2"],
    paddingHorizontal: Spacing["spacing-2"],
    paddingVertical: Spacing["spacing-1"],
  },
  badgeLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    flex: 1,
  },
});
