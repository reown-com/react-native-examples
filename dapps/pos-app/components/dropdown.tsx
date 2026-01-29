import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { FramedModal } from "./framed-modal";
import { ThemedText } from "./themed-text";
import { Button } from "./button";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  style,
}: DropdownProps<T>) {
  const Theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (option: DropdownOption<T>) => {
      onChange(option.value);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleBackdropPress = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <View style={style}>
      {/* Trigger Button */}
      <Button
        onPress={handleToggle}
        style={[
          styles.trigger,
          {
            backgroundColor: Theme["foreground-primary"],
            borderColor: isOpen ? Theme["border-primary"] : "transparent",
          },
        ]}
      >
        <View style={styles.triggerContent}>
          {label && (
            <ThemedText fontSize={16} lineHeight={18} color="text-primary">
              {label}
            </ThemedText>
          )}
          <ThemedText
            fontSize={14}
            lineHeight={16}
            color={selectedOption ? "text-secondary" : "text-tertiary"}
          >
            {selectedOption?.label ?? placeholder}
          </ThemedText>
        </View>
        <ThemedText
          fontSize={12}
          color="text-secondary"
          style={[styles.chevron, isOpen && styles.chevronOpen]}
        >
          ▼
        </ThemedText>
      </Button>

      {/* Dropdown Modal */}
      <FramedModal visible={isOpen} onRequestClose={handleBackdropPress}>
        <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.optionsContainer,
              {
                backgroundColor: Theme["foreground-primary"],
                borderColor: Theme["border-primary"],
              },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item, index) => item.value ?? `option-${index}`}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: pressed
                          ? Theme["foreground-secondary"]
                          : isSelected
                            ? Theme["foreground-tertiary"]
                            : "transparent",
                      },
                    ]}
                  >
                    <ThemedText
                      fontSize={16}
                      lineHeight={20}
                      color={isSelected ? "text-primary" : "text-secondary"}
                    >
                      {item.label}
                    </ThemedText>
                    {isSelected && (
                      <ThemedText fontSize={24} color="text-primary">
                        ✓
                      </ThemedText>
                    )}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: Theme["border-primary"] },
                  ]}
                />
              )}
            />
          </Pressable>
        </Pressable>
      </FramedModal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: Spacing["spacing-7"],
    paddingRight: Spacing["spacing-9"],
    paddingVertical: Spacing["spacing-4"],
    borderRadius: BorderRadius["5"],
    borderWidth: 1,
    height: 80,
  },
  triggerContent: {
    flex: 1,
    gap: Spacing["spacing-1"],
  },
  chevron: {
    marginLeft: Spacing["spacing-2"],
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: Spacing["spacing-5"],
  },
  optionsContainer: {
    width: "100%",
    maxHeight: 300,
    borderRadius: BorderRadius["4"],
    borderWidth: 1,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing["spacing-5"],
    paddingVertical: Spacing["spacing-7"],
  },
  separator: {
    height: 1,
  },
});
