import { useTheme } from "@/hooks/use-theme-color";
import { memo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export interface NumericKeyboardProps {
  onKeyPress: (value: string) => void;
}

function NumericKeyboardBase({ onKeyPress }: NumericKeyboardProps) {
  const Theme = useTheme();
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [",", "0", "erase"],
  ];

  const handlePress = (key: string) => {
    onKeyPress(key);
  };

  return (
    <ThemedView>
      {keys.map((row, rowIndex) => (
        <ThemedView key={`row-${rowIndex}`} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.key}
              onPress={() => handlePress(key)}
            >
              {key === "erase" ? (
                <ThemedText
                  testID="key-erase"
                  style={[styles.keyText, { color: Theme.text }]}
                >
                  ←
                </ThemedText>
              ) : (
                <ThemedText
                  testID={`key-${key}`}
                  style={[styles.keyText, { color: Theme.text }]}
                >
                  {key}
                </ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </ThemedView>
      ))}
    </ThemedView>
  );
}

export const NumericKeyboard = memo(NumericKeyboardBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  key: {
    width: 70,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 26,
  },
});
