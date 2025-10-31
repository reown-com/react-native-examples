import { CustomPressableProps, PressableScale } from 'pressto';
import React from 'react';

export const Button: React.FC<CustomPressableProps> = ({
  children,
  style,
  onPress,
  ...props
}) => {
  return (
    <PressableScale {...props} style={style} onPress={onPress}>
      {children}
    </PressableScale>
  );
};
