import { CurrencyPicker } from "@/components/currency-picker";
import { NumericKeyboard } from "@/components/numeric-keyboard";
import { PrimaryButton } from "@/components/primary-button";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  amountToCents,
  exceedsU64Max,
  formatAmountWithSymbol,
  getCurrency,
} from "@/utils/currency";
import { showErrorToast } from "@/utils/toast";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function AmountScreen() {
  const Theme = useTheme();
  const currencyCode = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const currency = getCurrency(currencyCode);
  const [raw, setRaw] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const onKey = (key: string) => {
    setRaw((prev) => {
      if (key === "erase") return prev.slice(0, -1);
      if (key === ".") return prev.includes(".") ? prev : prev || "0" + ".";
      // limit to 2 decimals
      if (prev.includes(".") && prev.split(".")[1]?.length >= 2) return prev;
      if (prev.length >= 9) return prev;
      if (prev === "0") return key;
      return prev + key;
    });
  };

  const cents = amountToCents(raw);
  const valid = cents > 0 && !exceedsU64Max(raw);
  const display = formatAmountWithSymbol(raw || "0", currency);

  const onCharge = () => {
    if (!valid) {
      showErrorToast("Enter an amount greater than zero");
      return;
    }
    router.push({
      pathname: "/pos/checkout",
      params: { amountCents: String(cents), currency: currencyCode },
    });
  };

  return (
    <Screen>
      <ScreenHeader onBack={() => router.back()} title="New payment" />

      <View style={styles.amountBlock}>
        <ThemedText weight="500" style={styles.amount}>
          {display}
        </ThemedText>
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={[
            styles.currencyBtn,
            {
              backgroundColor: Theme["foreground-primary"],
              borderColor: Theme["border-primary"],
            },
          ]}
        >
          <ThemedText weight="500" style={styles.currencyLabel}>
            {currency.code}
          </ThemedText>
          <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
            <Path
              d="M5 8l5 5 5-5"
              stroke={Theme["text-primary"]}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </View>

      <View style={styles.keypad}>
        <NumericKeyboard onKeyPress={onKey} />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={valid ? `Charge ${display}` : "Charge —"}
          onPress={onCharge}
          disabled={!valid}
        />
      </View>

      <CurrencyPicker
        visible={pickerOpen}
        selected={currencyCode}
        onClose={() => setPickerOpen(false)}
        onSelect={setCurrency}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountBlock: {
    alignItems: "center",
    paddingTop: Spacing["spacing-8"],
    paddingBottom: Spacing["spacing-4"],
  },
  amount: {
    fontSize: 56,
    lineHeight: 64,
  },
  currencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 99,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginTop: Spacing["spacing-3"],
  },
  currencyLabel: {
    fontSize: 14,
  },
  keypad: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: Spacing["spacing-4"],
  },
  footer: {
    paddingHorizontal: Spacing["spacing-6"],
    paddingTop: Spacing["spacing-4"],
    paddingBottom: Spacing["spacing-4"],
  },
});
