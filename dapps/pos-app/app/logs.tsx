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

  return (
    <View style={styles.container}>
      {logs.length === 0 ? (
        <EmptyState
          title="No logs yet"
          subtitle="Logs record what happens on this terminal. Only the most recent entries are kept."
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
            ListEmptyComponent={
              <EmptyState
                title="No matching logs"
                subtitle="No logs match the selected filters. Try adjusting the type or date range."
              />
            }
          />
          <Button
            type="neutral"
            variant="secondary"
            onPress={() => setConfirmVisible(true)}
            style={styles.clearButton}
          >
            Clear logs
          </Button>
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
  clearButton: {
    marginTop: Spacing["spacing-3"],
    marginHorizontal: Spacing["spacing-5"],
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
