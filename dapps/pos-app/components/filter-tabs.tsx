import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { TransactionFilterType } from "@/utils/types";
import { memo, useCallback, useRef } from "react";
import { LayoutChangeEvent, ScrollView, StyleSheet, View } from "react-native";
import { Button } from "./button";
import { ThemedText } from "./themed-text";

interface FilterTabsProps {
  selectedFilter: TransactionFilterType;
  onFilterChange: (filter: TransactionFilterType) => void;
}

interface FilterOption {
  key: TransactionFilterType;
  label: string;
  dotThemeKey?: "icon-error" | "foreground-tertiary" | "icon-success";
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: "all", label: "All" },
  { key: "failed", label: "Failed", dotThemeKey: "icon-error" },
  { key: "pending", label: "Pending", dotThemeKey: "foreground-tertiary" },
  { key: "completed", label: "Completed", dotThemeKey: "icon-success" },
];

function FilterTabsBase({ selectedFilter, onFilterChange }: FilterTabsProps) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const handleTabLayout = useCallback(
    (key: string, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      tabLayouts.current[key] = { x, width };
    },
    [],
  );

  const handleTabPress = useCallback(
    (key: TransactionFilterType) => {
      const layout = tabLayouts.current[key];
      if (layout && scrollRef.current) {
        const padding = Spacing["spacing-5"];
        scrollRef.current.scrollTo({
          x: layout.x - padding,
          animated: true,
        });
      }
      onFilterChange(key);
    },
    [onFilterChange],
  );

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {FILTER_OPTIONS.map((option) => {
        const isSelected = selectedFilter === option.key;

        return (
          <Button
            key={option.key}
            onPress={() => handleTabPress(option.key)}
            onLayout={(e) => handleTabLayout(option.key, e)}
            style={[
              styles.tab,
              {
                borderColor: isSelected
                  ? theme["border-accent-primary"]
                  : theme["foreground-primary"],
                backgroundColor: isSelected
                  ? theme["foreground-accent-primary-10"]
                  : theme["foreground-primary"],
              },
            ]}
          >
            {option.dotThemeKey && (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: theme[option.dotThemeKey] },
                ]}
              />
            )}
            <ThemedText
              fontSize={14}
              color={isSelected ? "text-primary" : "text-secondary"}
            >
              {option.label}
            </ThemedText>
          </Button>
        );
      })}
    </ScrollView>
  );
}

export const FilterTabs = memo(FilterTabsBase);

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing["spacing-2"],
    paddingVertical: Spacing["spacing-1"],
    paddingHorizontal: Spacing["spacing-5"],
  },
  tab: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing["spacing-4"],
    paddingHorizontal: Spacing["spacing-5"],
    borderRadius: BorderRadius["4"],
    gap: Spacing["spacing-2"],
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius["full"],
  },
});
