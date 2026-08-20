import { PressableScale } from "pressto";
import React from "react";
import { AccessibilityRole, StyleProp, ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Pressable: React.FC<Props> = ({
  children,
  style,
  onPress,
  disabled,
  testID,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
}) => {
  return (
    <PressableScale
      style={style}
      onPress={onPress}
      enabled={!disabled}
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
    >
      {children}
    </PressableScale>
  );
};
