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
  testID?: string;
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
  testID,
  type,
  variant,
}: ButtonProps) {
  const theme = useTheme();

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
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        variantStyle,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        <ThemedText
          color={textColor}
          fontSize={18}
          lineHeight={20}
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
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["spacing-2"],
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
