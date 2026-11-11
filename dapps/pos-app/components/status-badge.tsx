import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { getTransactionStatusMeta } from "@/utils/transaction-status";
import { TransactionStatus } from "@/utils/types";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

interface StatusBadgeProps {
  status: TransactionStatus;
}

function StatusBadgeBase({ status }: StatusBadgeProps) {
  const theme = useTheme();
  const meta = getTransactionStatusMeta(status);
  const tint = theme[meta.iconTintKey];

  // Design system "Status": fill/{type}/subtle, icon/{type}/default (16,
  // decorative) and content/{type}/default label, 24 high, radius 8.
  return (
    <View
      style={[styles.container, { backgroundColor: theme[meta.iconBgKey] }]}
    >
      <Image
        source={meta.badgeIcon ?? meta.icon}
        style={styles.icon}
        tintColor={tint}
        contentFit="contain"
        cachePolicy="memory-disk"
        accessible={false}
        aria-hidden
      />
      <ThemedText
        fontSize={12}
        lineHeight={16}
        style={[styles.text, { color: theme[meta.titleColorKey] }]}
      >
        {meta.label}
      </ThemedText>
    </View>
  );
}

export const StatusBadge = memo(StatusBadgeBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-1"],
    height: 24,
    paddingHorizontal: Spacing["spacing-2"],
    borderRadius: BorderRadius["2"],
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  icon: {
    width: 16,
    height: 16,
  },
  text: {
    fontWeight: "500",
  },
});
