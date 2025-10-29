import { Button } from "@/components/button";
import { NumericKeyboard } from "@/components/numeric-keyboard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";

interface FormData {
  amount: string;
}

export default function AmountScreen() {
  const Theme = useTheme();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      amount: "0",
    },
  });

  const onSubmit = ({ amount }: FormData) => {
    if (amount.endsWith(".")) {
      setValue("amount", `${amount}00`);
    }
    router.push({
      pathname: "/payment-method",
      params: {
        amount,
      },
    });
  };

  const watchAmount = watch("amount");

  return (
    <ThemedView style={styles.container}>
      <ThemedView
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
                watchAmount === "0"
                  ? Theme["text-secondary"]
                  : Theme["text-primary"],
            },
          ]}
        >
          ${watchAmount}
        </ThemedText>
      </ThemedView>
      <Controller
        control={control}
        name="amount"
        rules={{
          validate: (value) => {
            if (!value || value === "0" || Number(value) === 0) {
              return "Amount is required";
            }
            return true;
          },
        }}
        render={({ field: { onChange, value: prev } }) => (
          <NumericKeyboard
            onKeyPress={(key) => {
              if (key === "erase") {
                const newDisplay = prev?.slice(0, -1) || "0";
                onChange?.(newDisplay);
              } else if (key === ".") {
                if (prev.includes(".")) return; // Don't add multiple commas
                const newDisplay = prev + ".";
                onChange?.(newDisplay);
              } else {
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
            backgroundColor: isValid
              ? Theme["bg-accent-primary"]
              : Theme["foreground-tertiary"], //TODO: Add a disabled color for buttons
          },
        ]}
      >
        <ThemedText
          style={[styles.buttonText, { color: Theme["text-invert"] }]}
        >
          {isValid ? `Charge $${watchAmount}` : "Enter Amount"}
        </ThemedText>
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-10"],
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
  buttonText: {
    fontSize: 18,
  },
});
