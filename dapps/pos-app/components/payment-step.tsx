import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

interface Props {
  isCompleted: boolean;
  isError: boolean;
  text: string;
}

export default function PaymentStep({ isCompleted, isError, text }: Props) {
  const Theme = useTheme();
  return (
    <ThemedView
      style={[
        styles.statusStep,
        { backgroundColor: Theme["foreground-primary"] },
      ]}
    >
      <IconSymbol
        name={
          isCompleted
            ? "checkmark.circle.fill"
            : isError
              ? "xmark.circle.fill"
              : "clock"
        }
        size={20}
        color={
          isCompleted
            ? Theme["icon-success"]
            : isError
              ? Theme["icon-error"]
              : Theme["icon-accent-primary"]
        }
      />
      <ThemedText
        style={[
          styles.text,
          {
            color: isCompleted
              ? Theme["text-success"]
              : isError
                ? Theme["text-error"]
                : Theme["text-primary"],
          },
        ]}
      >
        {text}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statusStep: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing["spacing-1"],
    paddingHorizontal: Spacing["spacing-3"],
    borderRadius: BorderRadius["3"],
  },
  text: {
    fontSize: 14,
    marginLeft: Spacing["spacing-2"],
    fontWeight: "500",
  },
});
