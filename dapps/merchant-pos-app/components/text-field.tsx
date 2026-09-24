import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./themed-text";

type Props = TextInputProps & {
  label?: string;
  optional?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  optional,
  containerStyle,
  style,
  ...rest
}: Props) {
  const Theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <ThemedText color="text-secondary" style={styles.label}>
          {label}
          {optional ? (
            <ThemedText color="text-tertiary" style={styles.label}>
              {"  (optional)"}
            </ThemedText>
          ) : null}
        </ThemedText>
      ) : null}
      <TextInput
        placeholderTextColor={Theme["text-tertiary"]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor: Theme["foreground-primary"],
            color: Theme["text-primary"],
            borderColor: focused
              ? Theme["border-accent-primary"]
              : Theme["border-primary"],
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing["spacing-4"],
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    height: 54,
    borderRadius: BorderRadius["4"],
    borderWidth: 1,
    paddingHorizontal: Spacing["spacing-4"],
    fontSize: 16,
    fontFamily: "KH Teka",
  },
});
