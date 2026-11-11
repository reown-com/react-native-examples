import { ColorKey } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { Image, ImageSource } from "expo-image";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Pressable } from "./pressable";
import { ThemedText } from "./themed-text";

/**
 * Sizes from the design system Button: height from button/size/*, label from
 * typography/component/button-*, icon from icon/size/*. The height never
 * changes with the viewport (no bigger buttons on tablet). lg is the default;
 * md is for dense layouts, sm for in-row actions.
 */
const SIZES = {
  lg: {
    height: 54,
    paddingX: 40,
    gap: 8,
    fontSize: 18,
    lineHeight: 24,
    icon: 24,
  },
  md: {
    height: 44,
    paddingX: 24,
    gap: 8,
    fontSize: 16,
    lineHeight: 20,
    icon: 20,
  },
  sm: {
    height: 32,
    paddingX: 16,
    gap: 4,
    fontSize: 14,
    lineHeight: 16,
    icon: 16,
  },
} as const;

interface ButtonBaseProps {
  children: string;
  /** Icon before the label: what the action is about. */
  iconLeft?: ImageSource;
  /** Icon after the label: where the action goes (chevron, arrow, external). */
  iconRight?: ImageSource;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: keyof typeof SIZES;
  testID?: string;
  /** Overrides the accessible name (defaults to the button's text label). */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Design system roles:
 * - accent / primary    → Primary Default: the screen's commit, one per screen.
 * - neutral / primary   → Primary Neutral: advances without being the decision.
 * - neutral / secondary → Secondary Default: no fill, 1px border.
 */
export type ButtonProps =
  | (ButtonBaseProps & { type: "accent"; variant: "primary" })
  | (ButtonBaseProps & { type: "neutral"; variant: "primary" | "secondary" });

interface VariantColors {
  backgroundColor?: ColorKey;
  borderColor?: ColorKey;
  label: ColorKey;
}

function getColors(
  type: ButtonProps["type"],
  variant: ButtonProps["variant"],
  disabled: boolean,
): VariantColors {
  if (type === "accent") {
    return disabled
      ? { backgroundColor: "bg-button-disabled", label: "text-disabled" }
      : { backgroundColor: "bg-accent-primary", label: "text-white" };
  }
  if (variant === "primary") {
    return disabled
      ? {
          backgroundColor: "bg-button-neutral-disabled",
          label: "text-disabled",
        }
      : { backgroundColor: "bg-invert", label: "text-invert" };
  }
  return disabled
    ? { borderColor: "border-button-disabled", label: "text-disabled" }
    : { borderColor: "border-secondary", label: "text-primary" };
}

export function Button({
  children,
  iconLeft,
  iconRight,
  style,
  onPress,
  disabled = false,
  fullWidth = true,
  size = "lg",
  testID,
  accessibilityLabel,
  accessibilityHint,
  type,
  variant,
}: ButtonProps) {
  const theme = useTheme();
  const spec = SIZES[size];
  const colors = getColors(type, variant, disabled);
  const labelColor = theme[colors.label];

  const renderIcon = (source: ImageSource) => (
    <Image
      source={source}
      style={{ width: spec.icon, height: spec.icon }}
      tintColor={labelColor}
      contentFit="contain"
      cachePolicy="memory-disk"
      accessible={false}
    />
  );

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
        { height: spec.height, paddingHorizontal: spec.paddingX },
        fullWidth && styles.fullWidth,
        colors.backgroundColor && {
          backgroundColor: theme[colors.backgroundColor],
        },
        colors.borderColor && {
          borderColor: theme[colors.borderColor],
          borderWidth: 1,
        },
        style,
      ]}
    >
      <View style={[styles.content, { gap: spec.gap }]}>
        {iconLeft && renderIcon(iconLeft)}
        <ThemedText
          fontSize={spec.fontSize}
          lineHeight={spec.lineHeight}
          color={colors.label}
          style={styles.label}
        >
          {children}
        </ThemedText>
        {iconRight && renderIcon(iconRight)}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    // radius/button → radius/full: every button is fully round, in all sizes.
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
});
