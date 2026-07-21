import { PressableScale } from "pressto";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

export const Button: React.FC<Props> = ({
  children,
  style,
  onPress,
  disabled,
  testID,
}) => {
  return (
    <PressableScale
      style={style}
      onPress={onPress}
      enabled={!disabled}
      testID={testID}
    >
      {children}
    </PressableScale>
  );
};
