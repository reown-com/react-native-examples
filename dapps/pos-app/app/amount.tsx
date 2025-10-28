import { Button } from "@/components/button";
import { NumericKeyboard } from "@/components/numeric-keyboard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
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
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      amount: "0",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
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
        {errors.amount && (
          <ThemedText
            style={[styles.errorText, { color: Theme["text-error"] }]}
          >
            {errors.amount.message}
          </ThemedText>
        )}
      </ThemedView>
      <Controller
        control={control}
        name="amount"
        rules={{
          validate: (value) => {
            if (!value || value === "0") {
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
        style={[styles.button, { backgroundColor: Theme["bg-accent-primary"] }]}
      >
        <ThemedText
          style={[styles.buttonText, { color: Theme["text-invert"] }]}
        >
          Charge ${watchAmount}
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
  errorText: {
    fontSize: 14,
    marginTop: Spacing["spacing-1"],
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
