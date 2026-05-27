import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { amountToCents, CURRENCIES, CurrencyCode } from "@/utils/currency";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { BottomSheet } from "./bottom-sheet";
import { PrimaryButton } from "./primary-button";
import { TextField } from "./text-field";
import { ThemedText } from "./themed-text";

interface Props {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onCreate: (input: {
    label?: string;
    amountCents: number;
    currency: CurrencyCode;
  }) => void;
}

export function CreateLinkSheet({
  visible,
  loading,
  onClose,
  onCreate,
}: Props) {
  const Theme = useTheme();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  const cents = amountToCents(amount);
  const valid = cents > 0;

  const submit = () => {
    if (!valid || loading) return;
    onCreate({
      label: label.trim() || undefined,
      amountCents: cents,
      currency,
    });
    setLabel("");
    setAmount("");
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="New payment link">
      <TextField
        label="Label"
        optional
        placeholder="e.g. Monthly subscription"
        value={label}
        onChangeText={setLabel}
      />
      <TextField
        label="Amount"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />
      <ThemedText color="text-secondary" style={styles.label}>
        Currency
      </ThemedText>
      <View style={styles.currencyRow}>
        {CURRENCIES.map((c) => {
          const active = c.code === currency;
          return (
            <Pressable
              key={c.code}
              onPress={() => setCurrency(c.code)}
              style={[
                styles.currencyChip,
                {
                  backgroundColor: active
                    ? Theme["surface-accent"]
                    : Theme["foreground-primary"],
                  borderColor: active
                    ? Theme["border-accent-primary"]
                    : Theme["border-primary"],
                },
              ]}
            >
              <ThemedText weight="500">
                {c.symbol} {c.code}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      <PrimaryButton
        label={loading ? "Generating…" : "Generate link"}
        onPress={submit}
        disabled={!valid || loading}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  currencyRow: {
    flexDirection: "row",
    gap: Spacing["spacing-3"],
    marginBottom: Spacing["spacing-5"],
  },
  currencyChip: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
