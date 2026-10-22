import { useTheme } from "@/hooks/use-theme-color";
import { Switch as RNSwitch, StyleProp, ViewStyle } from "react-native";

interface Props {
  style?: StyleProp<ViewStyle>;
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
}

export function Switch({ style, value, onValueChange, testID }: Props) {
  const Theme = useTheme();

  return (
    <RNSwitch
      testID={testID}
      style={style}
      value={value}
      onValueChange={onValueChange}
      thumbColor="white"
      // @ts-ignore - activeThumbColor is a valid prop for Web Switch
      activeThumbColor="white"
      trackColor={{
        true: Theme["icon-accent-primary"],
        false: Theme["foreground-tertiary"],
      }}
    />
  );
}
