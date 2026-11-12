import { useTheme } from "@/hooks/use-theme-color";
import { Switch as RNSwitch, StyleProp, ViewStyle } from "react-native";

interface Props {
  style?: StyleProp<ViewStyle>;
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
  /** Names the setting; without it screen readers announce only "on"/"off". */
  accessibilityLabel?: string;
}

export function Switch({
  style,
  value,
  onValueChange,
  testID,
  accessibilityLabel,
}: Props) {
  const Theme = useTheme();

  return (
    <RNSwitch
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      aria-label={accessibilityLabel}
      style={style}
      value={value}
      onValueChange={onValueChange}
      thumbColor="white"
      // @ts-ignore - activeThumbColor is a valid prop for Web Switch
      activeThumbColor="white"
      trackColor={{
        true: Theme["icon-primary-default"],
        false: Theme["border-default"],
      }}
    />
  );
}
