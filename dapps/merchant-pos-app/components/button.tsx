import { PressableScale } from "pressto";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  disabled?: boolean;
}

export const Button: React.FC<Props> = ({
  children,
  style,
  onPress,
  disabled,
}) => {
  return (
    <PressableScale style={style} onPress={onPress} enabled={!disabled}>
      {children}
    </PressableScale>
  );
};
