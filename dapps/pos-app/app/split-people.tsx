import { BigAmountInput } from "@/components/big-amount-input";
import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  amountToCents,
  formatAmountWithSymbol,
  getCurrency,
} from "@/utils/currency";
import { router, UnknownOutputParams, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

interface ScreenParams extends UnknownOutputParams {
  totalAmount: string;
}

const PEOPLE_ROWS: (number | "custom")[][] = [
  [2, 3, 4],
  [5, 6, "custom"],
];

const formatCents = (cents: number): string => {
  const whole = Math.floor(cents / 100);
  const fraction = (cents % 100).toString().padStart(2, "0");
  return `${whole}.${fraction}`;
};

export default function SplitPeopleScreen() {
  const Theme = useTheme();
  const params = useLocalSearchParams<ScreenParams>();
  const currencyCode = useSettingsStore((state) => state.currency);
  const currency = getCurrency(currencyCode);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);

  const { totalAmount } = params;
  const totalCents = amountToCents(totalAmount);

  const perPersonAmount = selectedCount
    ? formatCents(Math.ceil(totalCents / selectedCount))
    : null;

  const handleSelect = (option: number | "custom") => {
    if (option === "custom") return;
    setSelectedCount(option);
  };

  const handleConfirm = () => {
    if (!selectedCount || !perPersonAmount) return;

    router.push({
      pathname: "/scan",
      params: {
        amount: perPersonAmount,
        splitIndex: "1",
        splitCount: String(selectedCount),
        splitTotalAmount: totalAmount,
        splitPaymentIds: "[]",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.amountContainer,
          { borderColor: Theme["border-primary"] },
        ]}
      >
        <BigAmountInput
          value={totalAmount}
          currency={currency.symbol}
          symbolPosition={currency.symbolPosition}
          isFocused={false}
        />
      </View>

      <View style={styles.middleSection}>
        <ThemedText
          style={[styles.subtitle, { color: Theme["text-secondary"] }]}
          fontSize={16}
          lineHeight={18}
        >
          Choose the amount of customers
        </ThemedText>

        <View style={styles.keyboard}>
          {PEOPLE_ROWS.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((option) => {
                const isCustom = option === "custom";
                const isSelected = !isCustom && selectedCount === option;
                return (
                  <Button
                    key={String(option)}
                    onPress={() => handleSelect(option)}
                    disabled={isCustom}
                    style={[
                      styles.key,
                      {
                        backgroundColor: isSelected
                          ? Theme["bg-accent-primary"]
                          : Theme["foreground-primary"],
                        opacity: isCustom ? 0.5 : 1,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.keyText,
                        {
                          color: isSelected
                            ? Theme["text-invert"]
                            : Theme["text-primary"],
                        },
                      ]}
                    >
                      {isCustom ? "+" : option}
                    </ThemedText>
                  </Button>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <Button
        onPress={handleConfirm}
        disabled={!selectedCount}
        style={[
          styles.button,
          {
            backgroundColor: Theme["bg-accent-primary"],
            opacity: selectedCount ? 1 : 0.6,
          },
        ]}
      >
        <ThemedText
          fontSize={16}
          lineHeight={18}
          style={{ color: Theme["text-invert"] }}
        >
          {selectedCount && perPersonAmount
            ? `Charge ${formatAmountWithSymbol(perPersonAmount, currency)} per customer`
            : "Select amount of customers"}
        </ThemedText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingTop: Spacing["spacing-5"],
    paddingBottom: Platform.OS === "web" ? 0 : Spacing["spacing-5"],
    gap: Spacing["spacing-6"],
  },
  amountContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["spacing-12"],
    paddingHorizontal: Spacing["spacing-5"],
  },
  middleSection: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing["spacing-6"],
  },
  subtitle: {
    textAlign: "center",
  },
  keyboard: {
    width: "100%",
    gap: Spacing["spacing-3"],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: Spacing["spacing-3"],
  },
  key: {
    flex: 1,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius["4"],
  },
  keyText: {
    fontSize: 22,
    lineHeight: 26,
  },
  button: {
    width: "100%",
    marginTop: "auto",
    paddingVertical: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-5"],
    alignItems: "center",
    borderRadius: BorderRadius["5"],
  },
});
