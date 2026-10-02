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
      />
      <ThemedText
        fontSize={14}
        lineHeight={16}
        style={[styles.text, { color: tint }]}
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
    paddingHorizontal: Spacing["spacing-2"],
    paddingVertical: 6,
    borderRadius: BorderRadius["2"],
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  icon: {
    width: 14,
    height: 14,
  },
  text: {
    fontWeight: "500",
  },
});
