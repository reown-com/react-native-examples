import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Pressable } from "./pressable";
import { ThemedText } from "./themed-text";

interface ButtonBaseProps {
  children: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "lg" | "md" | "sm";
  testID?: string;
  /** Overrides the accessible name (defaults to the button's text label). */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export type ButtonProps =
  | (ButtonBaseProps & { type: "accent"; variant: "primary" })
  | (ButtonBaseProps & { type: "neutral"; variant: "secondary" | "tertiary" });

export function Button({
  children,
  icon,
  style,
  onPress,
  disabled = false,
  fullWidth = true,
  size = "md",
  testID,
  accessibilityLabel,
  accessibilityHint,
  type,
  variant,
}: ButtonProps) {
  const theme = useTheme();
  const isSmall = size === "sm";
  const isLarge = size === "lg";

  const variantStyle =
    type === "accent"
      ? {
          backgroundColor: theme["bg-accent-primary"],
        }
      : variant === "secondary"
        ? {
            borderColor: theme["border-secondary"],
            borderWidth: 1,
          }
        : {
            backgroundColor: theme["bg-invert"],
          };

  const textColor =
    type === "accent"
      ? "text-white"
      : variant === "secondary"
        ? "text-primary"
        : "text-invert";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityHint={accessibilityHint}
      style={[
        styles.button,
        isSmall && styles.buttonSmall,
        isLarge && styles.buttonLarge,
        fullWidth && styles.fullWidth,
        variantStyle,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          isSmall && styles.contentSmall,
          isLarge && styles.contentLarge,
        ]}
      >
        <ThemedText
          color={textColor}
          fontSize={isSmall ? 12 : isLarge ? 22 : 18}
          lineHeight={isSmall ? 14 : isLarge ? 24 : 20}
          style={styles.label}
        >
          {children}
        </ThemedText>
        {icon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: BorderRadius["4"],
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSmall: {
    height: 28,
    borderRadius: 10,
    paddingHorizontal: Spacing["spacing-3"],
  },
  buttonLarge: {
    height: 64,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["spacing-2"],
  },
  contentSmall: {
    gap: Spacing["spacing-1"],
  },
  contentLarge: {
    gap: Spacing["spacing-3"],
  },
  label: {
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
  },
});
