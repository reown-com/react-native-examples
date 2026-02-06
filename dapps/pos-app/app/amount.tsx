import { Button } from "@/components/button";
import { NumericKeyboard } from "@/components/numeric-keyboard";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useSettingsStore } from "@/store/useSettingsStore";
import { formatAmountWithSymbol, getCurrency } from "@/utils/currency";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
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
  const currencyCode = useSettingsStore((state) => state.currency);
  const currency = getCurrency(currencyCode);
  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      amount: "",
    },
  });
  const watchAmount = watch("amount");

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
    <View style={styles.container}>
      <View
        style={[
          styles.amountContainer,
          { borderColor: Theme["border-primary"] },
        ]}
      >
        <ThemedText
          numberOfLines={1}
          style={[
            styles.amountText,
            {
              color:
                watchAmount === ""
                  ? Theme["text-secondary"]
                  : Theme["text-primary"],
            },
          ]}
        >
          {formatAmountWithSymbol(watchAmount || "0.00", currency)}
        </ThemedText>
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
                // Limit to 2 decimal digits
                if (prev.includes(".")) {
                  const [, decimal] = prev.split(".");
                  if (decimal.length >= 2) return;
                }
                const newDisplay = prev === "0" ? key : prev + key;
                onChange?.(newDisplay);
              }
            }}
          />
        )}
      />
      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid}
        style={[
          styles.button,
          {
            backgroundColor: Theme["bg-accent-primary"],
            opacity: isValid ? 1 : 0.6,
          },
        ]}
      >
        <ThemedText
          fontSize={18}
          lineHeight={20}
          style={{ color: Theme["text-invert"] }}
        >
          {isValid
            ? `Charge ${formatAmountWithSymbol(formatAmount(watchAmount), currency)}`
            : "Enter amount"}
        </ThemedText>
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
  amountContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-5"],
  },
  amountText: {
    fontSize: 50,
    textAlign: "center",
    lineHeight: 50,
  },
  button: {
    width: "100%",
    marginTop: Spacing["spacing-6"],
    paddingVertical: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-5"],
    alignItems: "center",
    borderRadius: BorderRadius["5"],
  },
});
