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
      style={[styles.statusStep, { backgroundColor: Theme.cardBackground }]}
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
          isCompleted ? Theme.success : isError ? Theme.error : Theme.primary
        }
      />
      <ThemedText
        style={[
          styles.text,
          {
            color: isCompleted
              ? Theme.success
              : isError
                ? Theme.error
                : Theme.text,
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
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  text: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
});
