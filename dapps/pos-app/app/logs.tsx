import { Button } from "@/components/button";
import { ClearLogsModal } from "@/components/clear-logs-modal";
import { EmptyState } from "@/components/empty-state";
import { Pressable } from "@/components/pressable";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { LogEntry, useLogsStore } from "@/store/useLogsStore";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const ANIMATION_DURATION = 200;
const EASING = Easing.inOut(Easing.ease);

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

interface LevelBadge {
  bg: string;
  text: string;
  label: string;
}

const getLevelBadge = (
  level: LogEntry["level"],
  theme: ReturnType<typeof useTheme>,
): LevelBadge => {
  switch (level) {
    case "error":
      return {
        bg: "rgba(223, 74, 52, 0.12)",
        text: theme["icon-error"],
        label: "Error",
      };
    case "info":
    default:
      return {
        bg: theme["bg-invert"],
        text: theme["text-invert"],
        label: "Info",
      };
  }
};

function LogItem({ item }: { item: LogEntry }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const hasData = !!item.data;
  const badge = getLevelBadge(item.level, theme);
  const context =
    item.view && item.functionName
      ? `${item.view}:${item.functionName}`
      : item.view || item.functionName || "";

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(expanded ? 180 : 0, {
      duration: ANIMATION_DURATION,
      easing: EASING,
    });
  }, [expanded, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const inner = (
    <>
      <View style={styles.logRow}>
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <View style={[styles.levelBadge, { backgroundColor: badge.bg }]}>
              <ThemedText
                fontSize={14}
                lineHeight={16}
                style={[styles.levelText, { color: badge.text }]}
              >
                {badge.label}
              </ThemedText>
            </View>
            <ThemedText fontSize={12} lineHeight={14} color="text-secondary">
              {formatTimestamp(item.timestamp)}
            </ThemedText>
          </View>
          <ThemedText
            fontSize={15}
            lineHeight={20}
            color="text-primary"
            style={styles.message}
          >
            {item.message}
          </ThemedText>
          {context ? (
            <ThemedText fontSize={13} lineHeight={16} color="text-secondary">
              {context}
            </ThemedText>
          ) : null}
        </View>
        {hasData ? (
          <Animated.View style={chevronStyle}>
            <Image
              source={require("@/assets/images/chevron-down.png")}
              tintColor={theme["text-secondary"]}
              contentFit="contain"
              style={styles.chevron}
            />
          </Animated.View>
        ) : null}
      </View>
      {expanded && hasData ? (
        <Animated.View entering={FadeIn.duration(150)}>
          <ThemedText
            fontSize={11}
            lineHeight={14}
            color="text-secondary"
            style={styles.data}
          >
            {JSON.stringify(item.data, null, 2)}
          </ThemedText>
        </Animated.View>
      ) : null}
    </>
  );

  const cardStyle = [
    styles.logItem,
    { backgroundColor: theme["foreground-primary-fix"] },
  ];

  if (!hasData) {
    return <View style={cardStyle}>{inner}</View>;
  }

  return (
    <Pressable onPress={() => setExpanded((v) => !v)} style={cardStyle}>
      {inner}
    </Pressable>
  );
}

export default function LogsScreen() {
  const theme = useTheme();
  const logs = useLogsStore((state) => state.logs);
  const clearLogs = useLogsStore((state) => state.clearLogs);

  const [confirmVisible, setConfirmVisible] = useState(false);

  const reversedLogs = [...logs].reverse();

  const renderItem = useCallback(
    ({ item }: { item: LogEntry }) => <LogItem item={item} />,
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
  logItem: {
    padding: Spacing["spacing-4"],
    borderRadius: BorderRadius["3"],
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
    marginBottom: Spacing["spacing-2"],
  },
  levelBadge: {
    padding: Spacing["spacing-1"] + Spacing["spacing-05"],
    borderRadius: BorderRadius["2"],
  },
  levelText: {
    fontWeight: "500",
  },
  chevron: {
    width: 20,
    height: 20,
  },
  message: {
    fontWeight: "500",
    marginBottom: Spacing["spacing-05"],
  },
  data: {
    marginTop: Spacing["spacing-3"],
    fontFamily: "monospace",
  },
  emptyIcon: {
    width: 64,
    height: 64,
  },
});
