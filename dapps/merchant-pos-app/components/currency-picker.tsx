import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { CURRENCIES, CurrencyCode } from "@/utils/currency";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { BottomSheet } from "./bottom-sheet";
import { ThemedText } from "./themed-text";

interface Props {
  visible: boolean;
  selected: CurrencyCode;
  onClose: () => void;
  onSelect: (code: CurrencyCode) => void;
}

/** Fiat settlement currency picker (USD / EUR) — matches WCPay's iso4217 amount unit. */
export function CurrencyPicker({
  visible,
  selected,
  onClose,
  onSelect,
}: Props) {
  const Theme = useTheme();
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Settlement currency"
    >
      {CURRENCIES.map((currency) => {
        const active = currency.code === selected;
        return (
          <Pressable
            key={currency.code}
            style={[styles.row, { borderBottomColor: Theme["border-primary"] }]}
            onPress={() => {
              onSelect(currency.code);
              onClose();
            }}
          >
            <View style={styles.left}>
              <View
                style={[
                  styles.symbol,
                  { backgroundColor: Theme["foreground-secondary"] },
                ]}
              >
                <ThemedText weight="500" style={styles.symbolText}>
                  {currency.symbol}
                </ThemedText>
              </View>
              <View>
                <ThemedText weight="500" style={styles.code}>
                  {currency.code}
                </ThemedText>
                <ThemedText color="text-secondary" style={styles.name}>
                  {currency.name}
                </ThemedText>
              </View>
            </View>
            {active ? (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 12l5 5L20 7"
                  stroke={Theme["icon-accent-primary"]}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            ) : null}
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing["spacing-4"],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  symbol: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolText: {
    fontSize: 15,
  },
  code: {
    fontSize: 15,
  },
  name: {
    fontSize: 13,
    marginTop: 1,
  },
});
