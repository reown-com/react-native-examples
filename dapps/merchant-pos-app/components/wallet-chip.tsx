import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { truncateAddress } from "@/utils/address";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";

interface Props {
  address: string;
  bare?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Connected-wallet pill with a green status dot and truncated address. */
export function WalletChip({ address, bare, style }: Props) {
  const Theme = useTheme();
  return (
    <View
      style={[
        styles.chip,
        bare
          ? null
          : {
              backgroundColor: Theme["foreground-primary"],
              borderColor: Theme["border-primary"],
              borderWidth: StyleSheet.hairlineWidth,
            },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: Theme["success"] }]} />
      <ThemedText color="text-secondary" style={styles.text}>
        {truncateAddress(address)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
    borderRadius: BorderRadius["full"],
    paddingVertical: Spacing["spacing-2"],
    paddingHorizontal: Spacing["spacing-3"],
    alignSelf: "flex-start",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
  },
});
