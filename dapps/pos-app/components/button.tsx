import { PressableScale } from "pressto";
import React from "react";
import { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  disabled?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export const Button: React.FC<Props> = ({
  children,
  style,
  onPress,
  disabled,
  onLayout,
}) => {
  return (
    <PressableScale
      style={style}
      onPress={onPress}
      enabled={!disabled}
      onLayout={onLayout}
    >
      {children}
    </PressableScale>
  );
};
