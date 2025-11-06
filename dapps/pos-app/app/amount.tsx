import { Button } from "@/components/button";
import { NumericKeyboard } from "@/components/numeric-keyboard";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

interface FormData {
  amount: string;
}

export default function AmountScreen() {
  const Theme = useTheme();
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
    let formattedAmount = amount;

    if (amount.endsWith(".")) {
      formattedAmount = `${amount}00`;
    }

    if (!formattedAmount.includes(".")) {
      formattedAmount = `${formattedAmount}.00`;
    }

    router.push({
      pathname: "/payment-token",
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
          ${watchAmount || "0.00"}
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
                if (prev.includes(".")) return; // Don't add multiple commas
                if (prev === "") {
                  newDisplay = "0.";
                } else {
                  newDisplay = prev + ".";
                }
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
            backgroundColor: Theme["bg-accent-primary"],
            opacity: isValid ? 1 : 0.6,
          },
        ]}
      >
        <ThemedText
          style={[styles.buttonText, { color: Theme["text-invert"] }]}
        >
          {isValid ? `Charge $${watchAmount}` : "Enter amount"}
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
    paddingVertical: Spacing["spacing-5"],
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
