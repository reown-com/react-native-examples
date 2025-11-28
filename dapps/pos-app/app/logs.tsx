import { Card } from "@/components/card";
import { CloseButton } from "@/components/close-button";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { LogEntry, useLogsStore } from "@/store/useLogsStore";
import { resetNavigation } from "@/utils/navigation";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getLevelColor = (level: LogEntry["level"]): string => {
  switch (level) {
    case "error":
      return "#DF4A34";
    case "info":
      return "#0988F0";
    case "log":
    default:
      return "#0988F0";
  }
};

function LogItem({ item }: { item: LogEntry }) {
  const Theme = useTheme();
  const levelColor = getLevelColor(item.level);
  const context =
    item.view && item.functionName
      ? `${item.view}:${item.functionName}`
      : item.view || item.functionName || "";

  return (
    <View
      style={[styles.logItem, { backgroundColor: Theme["foreground-primary"] }]}
    >
      <View style={styles.logHeader}>
        <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
          <ThemedText fontSize={10} lineHeight={12} color="text-invert">
            {item.level.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText fontSize={11} lineHeight={13} color="text-secondary">
          {formatTimestamp(item.timestamp)}
        </ThemedText>
      </View>
      {context ? (
        <ThemedText
          fontSize={11}
          lineHeight={13}
          color="text-secondary"
          style={styles.context}
        >
          {context}
        </ThemedText>
      ) : null}
      <ThemedText fontSize={13} lineHeight={16} color="text-primary">
        {item.message}
      </ThemedText>
      {item.data ? (
        <ThemedText
          fontSize={11}
          lineHeight={14}
          color="text-secondary"
          style={styles.data}
        >
          {JSON.stringify(item.data, null, 2)}
        </ThemedText>
      ) : null}
    </View>
  );
}

export default function Logs() {
  const Theme = useTheme();
  const logs = useLogsStore((state) => state.logs);
  const clearLogs = useLogsStore((state) => state.clearLogs);

  const reversedLogs = [...logs].reverse();

  const renderItem = useCallback(
    ({ item }: { item: LogEntry }) => <LogItem item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: LogEntry) => item.id, []);

  return (
    <View style={styles.container}>
      <Card onPress={clearLogs} style={styles.clearButton}>
        <ThemedText fontSize={16} lineHeight={18}>
          Clear Logs
        </ThemedText>
      </Card>

      {reversedLogs.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText fontSize={16} lineHeight={20} color="text-secondary">
            No logs yet
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={reversedLogs}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <LinearGradient
        colors={[
          Theme["bg-primary"] + "00",
          Theme["bg-primary"] + "40",
          Theme["bg-primary"] + "CC",
          Theme["bg-primary"],
        ]}
        locations={[0, 0.3, 0.5, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />
      <CloseButton style={styles.closeButton} onPress={resetNavigation} />
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginBottom: Spacing["spacing-3"],
  },
  listContent: {
    paddingBottom: Spacing["extra-spacing-2"],
    gap: Spacing["spacing-2"],
  },
  logItem: {
    padding: Spacing["spacing-3"],
    borderRadius: 8,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
    marginBottom: Spacing["spacing-1"],
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  context: {
    marginBottom: Spacing["spacing-1"],
    fontStyle: "italic",
  },
  data: {
    marginTop: Spacing["spacing-2"],
    fontFamily: "monospace",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    alignSelf: "center",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
});
