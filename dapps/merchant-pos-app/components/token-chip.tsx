import { TokenConfig } from "@/constants/networks";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Pressable, StyleSheet, View } from "react-native";
import { TokenGlyph } from "./chain-token-icons";
import { ThemedText } from "./themed-text";

interface Props {
  token: TokenConfig;
  selected: boolean;
  onPress: () => void;
}

export function TokenChip({ token, selected, onPress }: Props) {
  const Theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
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
      <TokenGlyph color={token.color} glyph={token.glyph} size={32} />
      <View>
        <ThemedText weight="500" style={styles.name}>
          {token.symbol}
        </ThemedText>
        <ThemedText color="text-secondary" style={styles.full}>
          {token.name}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
    borderRadius: BorderRadius["4"],
    borderWidth: 1.5,
    paddingVertical: Spacing["spacing-3"],
    paddingHorizontal: Spacing["spacing-4"],
  },
  name: {
    fontSize: 15,
  },
  full: {
    fontSize: 11,
    marginTop: 1,
  },
});
