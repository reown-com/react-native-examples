import { BigAmountInput } from "@/components/big-amount-input";
import { Button } from "@/components/button";
import { NumericKeyboard } from "@/components/numeric-keyboard";
import { SandboxBanner } from "@/components/sandbox-banner";
import { Spacing } from "@/constants/spacing";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useTheme } from "@/hooks/use-theme-color";
import { isSandboxModeAvailable } from "@/utils/feature-flags";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  exceedsU64Max,
  formatAmountWithSymbol,
  getCurrency,
} from "@/utils/currency";
import { router } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Platform, StyleSheet, View } from "react-native";

interface FormData {
  amount: string;
}

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

export default function AmountScreen() {
  const Theme = useTheme();
  const sandboxMode = useSettingsStore((state) => state.sandboxMode);
  const isSandboxPayment = isSandboxModeAvailable && sandboxMode;
  const isTablet = useIsTablet();
  const currencyCode = useSettingsStore((state) => state.currency);
  const currency = getCurrency(currencyCode);
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      amount: "",
    },
  });
  const watchAmount = useWatch({ control, name: "amount" });

  const onSubmit = ({ amount }: FormData) => {
    const formattedAmount = formatAmount(amount);

    router.push({
      pathname: "/scan",
      params: {
        amount: formattedAmount,
      },
    });
  };

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      {isSandboxPayment && <SandboxBanner style={styles.sandboxBanner} />}
      <View
        style={[
          styles.amountContainer,
          { borderColor: Theme["border-primary"] },
        ]}
      >
        <BigAmountInput
          testID="amount-display"
          value={watchAmount}
          currency={currency.symbol}
          symbolPosition={currency.symbolPosition}
          size={isTablet ? "lg" : "md"}
        />
      </View>
      <Controller
        control={control}
        name="amount"
        rules={{
          validate: (value) => {
            if (
              !value ||
              value === "0" ||
              value === "" ||
              Number(value) === 0
            ) {
              return "Amount is required";
            }
            return true;
          },
        }}
        render={({ field: { onChange, value: prev } }) => (
          <NumericKeyboard
            onKeyPress={(key) => {
              let newDisplay;
              if (key === "erase") {
                newDisplay = prev?.slice(0, -1) || "";
                onChange?.(newDisplay);
              } else if (key === ".") {
                if (prev.includes(".")) return; // Don't add multiple decimal separators
                if (prev === "") {
                  newDisplay = "0.";
                } else {
                  newDisplay = prev + ".";
                }
                onChange?.(newDisplay);
              } else {
                // Limit to 2 decimal places
                if (prev.includes(".")) {
                  const decimalPart = prev.split(".")[1] || "";
                  if (decimalPart.length >= 2) return;
                }
                const newDisplay = prev === "0" ? key : prev + key;
                if (exceedsU64Max(newDisplay)) return;
                onChange?.(newDisplay);
              }
            }}
          />
        )}
      />
      <Button
        type="accent"
        variant="primary"
        testID="charge-button"
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid}
        size={isTablet ? "lg" : "md"}
        style={[styles.button, isTablet && styles.buttonTablet]}
      >
        {isValid
          ? `Charge ${formatAmountWithSymbol(formatAmount(watchAmount), currency)}`
          : "Enter amount"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  sandboxBanner: {
    width: "100%",
  },
  button: {
    marginTop: Spacing["spacing-6"],
  },
  buttonTablet: {
    marginTop: Spacing["spacing-8"],
  },
});
