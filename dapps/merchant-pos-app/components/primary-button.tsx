import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Button } from "./button";
import { ThemedText } from "./themed-text";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** The full-width pill button used across the app (matches prototype .btn styles). */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = "primary",
  icon,
  style,
}: Props) {
  const Theme = useTheme();

  const bg: Record<Variant, string> = {
    primary: Theme["bg-accent-primary"],
    secondary: Theme["foreground-primary"],
    ghost: "transparent",
    danger: Theme["surface-error"],
  };
  const fg: Record<Variant, string> = {
    primary: Theme["text-white"],
    secondary: Theme["text-primary"],
    ghost: Theme["text-accent-primary"],
    danger: Theme["text-error"],
  };
  const border: Record<Variant, string | undefined> = {
    primary: undefined,
    secondary: Theme["border-primary"],
    ghost: undefined,
    danger: Theme["surface-error"],
  };

  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: bg[variant], opacity: disabled ? 0.4 : 1 },
        border[variant]
          ? {
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: border[variant],
            }
          : null,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon}
        <ThemedText weight="500" style={[styles.label, { color: fg[variant] }]}>
          {label}
        </ThemedText>
      </View>
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 54,
    borderRadius: BorderRadius["4"],
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
  },
  label: {
    fontSize: 16,
  },
});
