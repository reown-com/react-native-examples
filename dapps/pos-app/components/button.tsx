import { PressableScale } from "pressto";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
}

export const Button: React.FC<Props> = ({ children, style, onPress }) => {
  return (
    <PressableScale style={style} onPress={onPress}>
      {children}
    </PressableScale>
  );
};
