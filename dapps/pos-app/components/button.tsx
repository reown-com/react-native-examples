import { BorderRadius } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Pressable } from "./pressable";

interface ButtonBaseProps {
  children: React.ReactNode;
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
      {children}
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
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
  },
});
