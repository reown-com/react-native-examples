import { Button } from "@/components/button";
import { ClearLogsModal } from "@/components/clear-logs-modal";
import { EmptyState } from "@/components/empty-state";
import { FilterButtons } from "@/components/filter-buttons";
import { LogCard } from "@/components/log-card";
import { RadioList, RadioOption } from "@/components/radio-list";
import { SettingsBottomSheet } from "@/components/settings-bottom-sheet";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { LogEntry, useLogsStore } from "@/store/useLogsStore";
import { DATE_RANGE_OPTIONS } from "@/utils/date-range";
import { filterLogs } from "@/utils/logs";
import { DateRangeFilterType, LogLevelFilterType } from "@/utils/types";
import { Image } from "expo-image";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

type ActiveSheet = "type" | "date" | null;

const TYPE_LABELS: Record<LogLevelFilterType, string> = {
  all: "Type",
  info: "Info",
  error: "Error",
};

export default function LogsScreen() {
  const theme = useTheme();
  const logs = useLogsStore((state) => state.logs);
  const clearLogs = useLogsStore((state) => state.clearLogs);
  const logLevelFilter = useLogsStore((state) => state.logLevelFilter);
  const setLogLevelFilter = useLogsStore((state) => state.setLogLevelFilter);
  const logDateRangeFilter = useLogsStore((state) => state.logDateRangeFilter);
  const setLogDateRangeFilter = useLogsStore(
    (state) => state.setLogDateRangeFilter,
  );

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  const typeOptions: RadioOption<LogLevelFilterType>[] = useMemo(
    () => [
      { value: "all", label: "All", dotColor: theme["icon-accent-primary"] },
      { value: "info", label: "Info", dotColor: theme["bg-invert"] },
      { value: "error", label: "Error", dotColor: theme["icon-error"] },
    ],
    [theme],
  );

  const dateLabel =
    logDateRangeFilter === "all_time"
      ? "Date"
      : (DATE_RANGE_OPTIONS.find((o) => o.value === logDateRangeFilter)
          ?.label ?? "Date");

  const filtered = useMemo(
    () => filterLogs([...logs].reverse(), logLevelFilter, logDateRangeFilter),
    [logs, logLevelFilter, logDateRangeFilter],
  );

  const renderItem = useCallback(
    ({ item }: { item: LogEntry }) => <LogCard item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: LogEntry) => item.id, []);

  const closeSheet = useCallback(() => setActiveSheet(null), []);

  const handleTypeChange = useCallback(
    (filter: LogLevelFilterType) => {
      setLogLevelFilter(filter);
      setActiveSheet(null);
    },
    [setLogLevelFilter],
  );

  const handleDateChange = useCallback(
    (filter: DateRangeFilterType) => {
      setLogDateRangeFilter(filter);
      setActiveSheet(null);
    },
    [setLogDateRangeFilter],
  );

  const handleConfirmClear = useCallback(() => {
    clearLogs();
    setConfirmVisible(false);
  }, [clearLogs]);

  const handleClearFilters = useCallback(() => {
    setLogLevelFilter("all");
    setLogDateRangeFilter("all_time");
  }, [setLogLevelFilter, setLogDateRangeFilter]);

  return (
    <View style={styles.container}>
      {logs.length === 0 ? (
        <EmptyState
          title="No logs to show"
          subtitle="Here you'll see what this terminal has been doing, from payments to printing and errors."
          icon={
            <Image
              source={require("@/assets/images/scroll.png")}
              contentFit="contain"
              tintColor={theme["icon-accent-primary"]}
              style={styles.emptyIcon}
            />
          }
        />
      ) : (
        <>
          <FilterButtons
            buttons={[
              {
                label: TYPE_LABELS[logLevelFilter],
                onPress: () => setActiveSheet("type"),
              },
              { label: dateLabel, onPress: () => setActiveSheet("date") },
            ]}
          />
          <View
            style={[
              styles.divider,
              { backgroundColor: theme["border-primary"] },
            ]}
          />
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            // Virtualization tuning for low-end POS hardware. No getItemLayout:
            // log cards have variable, content-driven heights and expand on tap,
            // so heights must stay measured rather than assumed. The list is
            // capped at 100 entries, so we keep a generous window to avoid blank
            // cells on fast Android scrolling, and skip removeClippedSubviews
            // (it drops cells mid-scroll on Android with these variable rows).
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={15}
            ListEmptyComponent={
              <EmptyState
                title="No matching logs"
                subtitle="No logs match the selected filters. Try adjusting the type or date range."
                cta={{ label: "Clear filters", onPress: handleClearFilters }}
              />
            }
          />
          {filtered.length > 0 && (
            <View style={styles.footer}>
              <Button
                type="neutral"
                variant="secondary"
                onPress={() => setConfirmVisible(true)}
              >
                Clear logs
              </Button>
            </View>
          )}
        </>
      )}

      <SettingsBottomSheet
        visible={activeSheet === "type"}
        title="Type"
        onClose={closeSheet}
      >
        <RadioList
          options={typeOptions}
          value={logLevelFilter}
          onChange={handleTypeChange}
        />
      </SettingsBottomSheet>

      <SettingsBottomSheet
        visible={activeSheet === "date"}
        title="Date range"
        onClose={closeSheet}
      >
        <RadioList
          options={DATE_RANGE_OPTIONS}
          value={logDateRangeFilter}
          onChange={handleDateChange}
        />
      </SettingsBottomSheet>

      <ClearLogsModal
        visible={confirmVisible}
        count={logs.length}
        onConfirm={handleConfirmClear}
        onClose={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing["spacing-5"],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing["spacing-5"],
    marginTop: Spacing["spacing-1"],
    marginBottom: Spacing["spacing-3"],
  },
  footer: {
    paddingTop: Spacing["spacing-3"],
    paddingHorizontal: Spacing["spacing-5"],
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing["spacing-5"],
    paddingBottom: Spacing["extra-spacing-2"],
    gap: Spacing["spacing-2"],
  },
  emptyIcon: {
    width: 64,
    height: 64,
  },
});
