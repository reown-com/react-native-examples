import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Pressable } from "./pressable";
import { ThemedText } from "./themed-text";

export interface NumericKeyboardProps {
  onKeyPress: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

function NumericKeyboardBase({ onKeyPress, style }: NumericKeyboardProps) {
  const Theme = useTheme();
  const isTablet = useIsTablet();
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
    <View style={[styles.container, isTablet && styles.containerTablet, style]}>
      {keys.map((row, rowIndex) => (
        <View
          key={`row-${rowIndex}`}
          style={[styles.row, isTablet && styles.rowTablet]}
        >
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => handlePress(key)}
              testID={key === "." ? "key-decimal" : `key-${key}`}
              accessibilityRole="button"
              accessibilityLabel={key === "erase" ? "Backspace" : key}
              style={[
                styles.key,
                isTablet && styles.keyTablet,
                { backgroundColor: Theme["foreground-primary-fix"] },
              ]}
            >
              {key === "erase" ? (
                <Image
                  source={assets?.[0]}
                  style={[
                    styles.backspace,
                    isTablet && styles.backspaceTablet,
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
                  style={[
                    styles.keyText,
                    isTablet && styles.keyTextTablet,
                    { color: Theme["text-primary"] },
                  ]}
                >
                  {key}
                </ThemedText>
              )}
            </Pressable>
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
  containerTablet: {
    gap: Spacing["spacing-5"],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: Spacing["spacing-3"],
  },
  rowTablet: {
    gap: Spacing["spacing-5"],
  },
  key: {
    flex: 1,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius["4"],
  },
  keyTablet: {
    height: 96,
  },
  keyText: {
    fontSize: 22,
    lineHeight: 26,
  },
  keyTextTablet: {
    fontSize: 28,
    lineHeight: 32,
  },
  backspace: {
    width: 22,
    height: 22,
  },
  backspaceTablet: {
    width: 28,
    height: 28,
  },
});
