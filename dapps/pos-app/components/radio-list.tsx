import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { Image, ImageSource } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ImageSource;
}

interface RadioListProps<T extends string = string> {
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function RadioList<T extends string = string>({
  options,
  value,
  onChange,
}: RadioListProps<T>) {
  const Theme = useTheme();

  return (
    <View style={styles.list}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.item,
              {
                backgroundColor: isSelected
                  ? Theme["bg-accent-primary"] + "1A"
                  : Theme["foreground-primary"],
                borderColor: isSelected
                  ? Theme["bg-accent-primary"]
                  : "transparent",
              },
            ]}
          >
            <View style={styles.labelRow}>
              {option.icon && (
                <Image
                  source={option.icon}
                  style={[
                    styles.icon,
                    {
                      tintColor: isSelected
                        ? Theme["icon-accent-primary"]
                        : Theme["text-primary"],
                    },
                  ]}
                  tintColor={
                    isSelected
                      ? Theme["icon-accent-primary"]
                      : Theme["text-primary"]
                  }
                  cachePolicy="memory-disk"
                />
              )}
              <ThemedText fontSize={16} lineHeight={18} color="text-primary">
                {option.label}
              </ThemedText>
            </View>
            {isSelected && (
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: Theme["icon-accent-primary"] },
                ]}
              >
                <View
                  style={[
                    styles.radioInner,
                    { backgroundColor: Theme["icon-accent-primary"] },
                  ]}
                />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing["spacing-2"],
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 68,
    paddingHorizontal: Spacing["spacing-5"],
    borderRadius: BorderRadius["4"],
    borderWidth: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  icon: {
    width: 24,
    height: 24,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
