import { PressableScale } from 'pressto';
import React from 'react';
import { StyleProp, ViewStyle, Insets } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  hitSlop?: number | Insets;
  testID?: string;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  hitSlop,
  testID,
  accessibilityLabel,
}) => {
  return (
    <PressableScale
      style={style}
      onPress={onPress}
      enabled={!disabled}
      hitSlop={hitSlop}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      // RNGH 3's BaseButton fires onPress on release even when the finger has
      // left the button (pressto ignores `pointerInside`), so a drag/swipe that
      // starts on a button would trigger it. Cancel the gesture once the
      // pointer leaves the bounds, matching RN Pressable / RNGH 2 behavior.
      shouldCancelWhenOutside
    >
      {children}
    </PressableScale>
  );
};
