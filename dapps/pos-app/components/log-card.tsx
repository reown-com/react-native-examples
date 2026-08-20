import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { LogEntry } from "@/store/useLogsStore";
import { buildLogText, formatTimestamp } from "@/utils/logs";
import { showSuccessToast } from "@/utils/toast";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { memo, useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button } from "./button";
import { ThemedText } from "./themed-text";

const ANIMATION_DURATION = 200;
const EASING = Easing.inOut(Easing.ease);

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

function LogCardBase({ item }: { item: LogEntry }) {
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

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(buildLogText(item));
    showSuccessToast("Log entry copied");
  }, [item]);

  const inner = (
    <>
      <View style={styles.logHeader}>
        <View style={styles.headerLeft}>
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
        <Button
          type="neutral"
          variant="secondary"
          size="sm"
          fullWidth={false}
          onPress={handleCopy}
          icon={
            <Image
              source={require("@/assets/images/copy.png")}
              tintColor={theme["text-primary"]}
              contentFit="contain"
              style={styles.copyIcon}
            />
          }
        >
          Copy entry
        </Button>
      </View>
      <View style={styles.logRow}>
        <View style={styles.logContent}>
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

export const LogCard = memo(LogCardBase);

const styles = StyleSheet.create({
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
    justifyContent: "space-between",
    gap: Spacing["spacing-2"],
    marginBottom: Spacing["spacing-2"],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
    flexShrink: 1,
  },
  copyIcon: {
    width: 14,
    height: 14,
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
});
