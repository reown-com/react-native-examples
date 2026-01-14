import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Button } from "./button";
import { ThemedText } from "./themed-text";

export interface NumericKeyboardProps {
  onKeyPress: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

function NumericKeyboardBase({ onKeyPress, style }: NumericKeyboardProps) {
  const Theme = useTheme();
  const [assets] = useAssets([require("@/assets/images/backspace.png")]);
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "erase"],
  ];

  const handlePress = (key: string) => {
    onKeyPress(key);
  };

  return (
    <View style={[styles.container, style]}>
      {keys.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((key) => (
            <Button
              key={key}
              onPress={() => handlePress(key)}
              style={[
                styles.key,
                { backgroundColor: Theme["foreground-primary"] },
              ]}
            >
              {key === "erase" ? (
                <Image
                  testID="key-erase"
                  source={assets?.[0]}
                  style={[
                    styles.backspace,
                    {
                      tintColor: Theme["text-primary"],
                    },
                  ]}
                  tintColor={Theme["text-primary"]}
                  cachePolicy="memory-disk"
                  priority="high"
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
        </View>
      ))}
    </View>
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
