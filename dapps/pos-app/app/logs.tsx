import { Button } from "@/components/button";
import { ClearLogsModal } from "@/components/clear-logs-modal";
import { EmptyState } from "@/components/empty-state";
import { LogCard } from "@/components/log-card";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { LogEntry, useLogsStore } from "@/store/useLogsStore";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

export default function LogsScreen() {
  const theme = useTheme();
  const logs = useLogsStore((state) => state.logs);
  const clearLogs = useLogsStore((state) => state.clearLogs);

  const [confirmVisible, setConfirmVisible] = useState(false);

  const reversedLogs = [...logs].reverse();

  const renderItem = useCallback(
    ({ item }: { item: LogEntry }) => <LogCard item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: LogEntry) => item.id, []);

  const handleConfirmClear = useCallback(() => {
    clearLogs();
    setConfirmVisible(false);
  }, [clearLogs]);

  return (
    <View style={styles.container}>
      {reversedLogs.length === 0 ? (
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
          <FlatList
            data={reversedLogs}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={styles.list}
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
    paddingHorizontal: Spacing["spacing-5"],
  },
  clearButton: {
    marginTop: Spacing["spacing-3"],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing["extra-spacing-2"],
    gap: Spacing["spacing-2"],
  },
  emptyIcon: {
    width: 64,
    height: 64,
  },
});
