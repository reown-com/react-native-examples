import { BigAmountInput } from "@/components/big-amount-input";
import { Button } from "@/components/button";
import { NumericKeyboard } from "@/components/numeric-keyboard";
import { TestModeOverlay } from "@/components/test-mode-pill";
import { Spacing } from "@/constants/spacing";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  exceedsU64Max,
  formatAmountWithSymbol,
  getCurrency,
} from "@/utils/currency";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

const formatAmount = (amount: string) => {
  if (!amount.includes(".")) {
    return `${amount}.00`;
  }
  const [whole, decimal] = amount.split(".");
  if (decimal.length === 0) {
    return `${whole}.00`;
  } else if (decimal.length === 1) {
    return `${whole}.${decimal}0`;
  }

  const trimmedDecimal = decimal.replace(/0+$/, "");
  const paddedDecimal =
    trimmedDecimal.length >= 2 ? trimmedDecimal : trimmedDecimal.padEnd(2, "0");
  return `${whole}.${paddedDecimal}`;
};

const getNextAmount = (prev: string, key: string) => {
  if (key === "erase") return prev.slice(0, -1);
  if (key === ".") {
    if (prev.includes(".")) return prev; // Don't add multiple decimal separators
    return prev === "" ? "0." : `${prev}.`;
  }
  // Limit to 2 decimal places
  const decimalPart = prev.split(".")[1];
  if (decimalPart !== undefined && decimalPart.length >= 2) return prev;
  const next = prev === "0" ? key : prev + key;
  return exceedsU64Max(next) ? prev : next;
};

const isValidAmount = (amount: string) => !!amount && Number(amount) !== 0;

export default function AmountScreen() {
  const Theme = useTheme();
  const testMode = useSettingsStore((state) => state.testMode);
  const isTestPayment = testMode;
  const isTablet = useIsTablet();
  const currencyCode = useSettingsStore((state) => state.currency);
  const currency = getCurrency(currencyCode);
  const [amount, setAmount] = useState("");
  const isValid = isValidAmount(amount);

  // Stable identity so the memoized NumericKeyboard doesn't re-render per key.
  const handleKeyPress = useCallback((key: string) => {
    setAmount((prev) => getNextAmount(prev, key));
  }, []);

  const onSubmit = () => {
    if (!isValid) return;
    router.push({
      pathname: "/scan",
      params: {
        amount: formatAmount(amount),
      },
    });
  };

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      {isTestPayment && <TestModeOverlay />}
      <View
        style={[
          styles.amountContainer,
          { borderColor: Theme["border-primary"] },
        ]}
      >
        <BigAmountInput
          testID="amount-display"
          value={amount}
          currency={currency.symbol}
          symbolPosition={currency.symbolPosition}
          size={isTablet ? "lg" : "md"}
        />
      </View>
      <NumericKeyboard onKeyPress={handleKeyPress} />
      <Button
        type="accent"
        variant="primary"
        testID="charge-button"
        onPress={onSubmit}
        disabled={!isValid}
        size={isTablet ? "lg" : "md"}
        style={[styles.button, isTablet && styles.buttonTablet]}
      >
        {isValid
          ? `Charge ${formatAmountWithSymbol(formatAmount(amount), currency)}`
          : "Enter amount"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing["spacing-5"],
    paddingTop: Spacing["spacing-5"],
    paddingBottom: Platform.OS === "web" ? 0 : Spacing["spacing-5"],
  },
  containerTablet: {
    paddingHorizontal: Spacing["spacing-8"],
    paddingTop: Spacing["spacing-8"],
  },
  amountContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-5"],
  },
  button: {
    marginTop: Spacing["spacing-6"],
  },
  buttonTablet: {
    marginTop: Spacing["spacing-8"],
  },
});
