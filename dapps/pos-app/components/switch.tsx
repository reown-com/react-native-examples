import { useTheme } from "@/hooks/use-theme-color";
import { Switch as RNSwitch, StyleProp, ViewStyle } from "react-native";

interface Props {
  style?: StyleProp<ViewStyle>;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Switch({ style, value, onValueChange }: Props) {
  const Theme = useTheme();

  return (
    <RNSwitch
      style={style}
      value={value}
      onValueChange={onValueChange}
      thumbColor="white"
      trackColor={{
        true: Theme["icon-accent-primary"],
        false: Theme["foreground-tertiary"],
      }}
    />
  );
}
