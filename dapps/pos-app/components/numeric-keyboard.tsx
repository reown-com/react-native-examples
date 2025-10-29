import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import { memo } from "react";
import { Image, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Button } from "./button";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export interface NumericKeyboardProps {
  onKeyPress: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

function NumericKeyboardBase({ onKeyPress, style }: NumericKeyboardProps) {
  const Theme = useTheme();
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "erase"],
  ];

  const handlePress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    onKeyPress(key);
  };

  return (
    <ThemedView style={[styles.container, style]}>
      {keys.map((row, rowIndex) => (
        <ThemedView key={`row-${rowIndex}`} style={styles.row}>
          {row.map((key) => (
            <Button
              key={key}
              onPress={() => handlePress(key)}
              style={[
                styles.key,
                { backgroundColor: Theme["foreground-primary"] },
              ]}
              zoomScale={0.95}
            >
              {key === "erase" ? (
                <Image
                  testID="key-erase"
                  source={require("@/assets/images/backspace.png")}
                  style={[
                    styles.backspace,
                    {
                      tintColor: Theme["text-primary"],
                    },
                  ]}
                />
              ) : (
                <ThemedText
                  testID={`key-${key}`}
                  style={[styles.keyText, { color: Theme["text-primary"] }]}
                >
                  {key}
                </ThemedText>
              )}
            </Button>
          ))}
        </ThemedView>
      ))}
    </ThemedView>
  );
}

export const NumericKeyboard = memo(NumericKeyboardBase);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacing["spacing-3"],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: Spacing["spacing-3"],
  },
  key: {
    flex: 1,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius["4"],
  },
  keyText: {
    fontSize: 22,
    lineHeight: 26,
  },
  backspace: {
    width: 22,
    height: 22,
  },
});
