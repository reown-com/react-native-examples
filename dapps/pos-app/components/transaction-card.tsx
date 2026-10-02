import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { formatFiatAmount } from "@/utils/currency";
import { formatDateTime } from "@/utils/misc";
import { getTransactionStatusMeta } from "@/utils/transaction-status";
import { PaymentRecord } from "@/utils/types";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Pressable } from "./pressable";
import { ThemedText } from "./themed-text";

const CHEVRON = require("@/assets/images/chevron-right.png");

interface TransactionCardProps {
  payment: PaymentRecord;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

function TransactionCardBase({
  payment,
  onPress,
  style,
}: TransactionCardProps) {
  const theme = useTheme();
  const meta = getTransactionStatusMeta(payment.status);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: theme["foreground-primary-fix"] },
        style,
      ]}
    >
      <View
        style={[styles.iconSquare, { backgroundColor: theme[meta.iconBgKey] }]}
      >
        <Image
          source={meta.icon}
          style={styles.icon}
          tintColor={theme[meta.iconTintKey]}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </View>

      <View style={styles.middle}>
        <ThemedText
          fontSize={16}
          lineHeight={18}
          color={meta.titleColorKey}
          style={styles.label}
        >
          {meta.label}
        </ThemedText>
        <ThemedText fontSize={14} lineHeight={18} color="text-secondary">
          {formatDateTime(payment.createdAt)}
        </ThemedText>
      </View>

      <View style={styles.trailing}>
        <ThemedText fontSize={16} lineHeight={18} color="text-primary">
          {formatFiatAmount(
            payment.fiatAmount?.value,
            payment.fiatAmount?.unit,
          )}
        </ThemedText>
        <Image
          source={CHEVRON}
          style={styles.chevron}
          tintColor={theme["icon-invert"]}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </View>
    </Pressable>
  );
}

export const TransactionCard = memo(TransactionCardBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
    padding: Spacing["spacing-3"],
    borderRadius: BorderRadius["3"],
    height: 70,
  },
  iconSquare: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius["3"],
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 20,
    height: 20,
  },
  middle: {
    flex: 1,
    gap: Spacing["spacing-05"],
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-1"],
  },
  chevron: {
    width: 20,
    height: 20,
  },
  label: {
    fontWeight: "500",
  },
});
