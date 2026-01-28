import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { formatFiatAmount } from "@/utils/currency";
import { formatDateTime } from "@/utils/misc";
import { formatCryptoReceived, getTokenSymbol } from "@/utils/tokens";
import { PaymentRecord } from "@/utils/types";
import { memo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button } from "./button";
import { StatusBadge } from "./status-badge";
import { ThemedText } from "./themed-text";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { showSuccessToast } from "@/utils/toast";
import { toastConfig } from "@/utils/toasts";
import Toast from "react-native-toast-message";

interface TransactionDetailModalProps {
  visible: boolean;
  payment: PaymentRecord | null;
  onClose: () => void;
}

/**
 * Truncate hash for display (e.g., "0x23...22d3")
 */
function truncateHash(hash?: string): string {
  if (!hash) return "-";
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 4)}...${hash.slice(-4)}`;
}

/**
 * Get the token icon based on CAIP-19 identifier
 * Returns the icon source or null if not USDC/USDT
 */
function getTokenIcon(tokenCaip19?: string): number | null {
  const symbol = getTokenSymbol(tokenCaip19);
  if (!symbol) return null;

  if (symbol === "USDC") {
    return require("@/assets/images/tokens/usdc.png");
  }
  if (symbol === "USDT") {
    return require("@/assets/images/tokens/usdt.png");
  }
  return null;
}

interface DetailRowProps {
  label: string;
  value?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  underline?: boolean;
}

function DetailRow({
  label,
  value,
  children,
  onPress,
  underline,
}: DetailRowProps) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        styles.detailRow,
        { backgroundColor: theme["foreground-primary"] },
      ]}
    >
      <ThemedText fontSize={16} color="text-secondary">
        {label}
      </ThemedText>
      {children || (
        <ThemedText
          fontSize={16}
          color="text-primary"
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[styles.valueText, underline && styles.underlineText]}
        >
          {value}
        </ThemedText>
      )}
    </View>
  );

  if (onPress) {
    return <Button onPress={onPress}>{content}</Button>;
  }

  return content;
}

function TransactionDetailModalBase({
  visible,
  payment,
  onClose,
}: TransactionDetailModalProps) {
  const theme = useTheme();

  if (!payment) return null;

  const handleCopyPaymentId = async () => {
    if (!payment?.payment_id) return;
    await Clipboard.setStringAsync(payment.payment_id);
    showSuccessToast("Payment ID copied to clipboard");
  };

  const handleCopyHash = async () => {
    if (!payment?.tx_hash) return;
    await Clipboard.setStringAsync(payment.tx_hash);
    showSuccessToast("Transaction hash copied to clipboard");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.container, { backgroundColor: theme["bg-primary"] }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Button
              onPress={onClose}
              style={[
                styles.closeButton,
                { borderColor: theme["border-secondary"] },
              ]}
            >
              <Image
                style={styles.closeIcon}
                tintColor={theme["icon-invert"]}
                source={require("@/assets/images/close.png")}
              />
            </Button>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.details}>
              <DetailRow
                label="Date"
                value={formatDateTime(payment.created_at)}
              />

              <DetailRow label="Status">
                <StatusBadge status={payment.status} />
              </DetailRow>

              <DetailRow
                label="Amount"
                value={formatFiatAmount(
                  payment.fiat_amount,
                  payment.fiat_currency,
                )}
              />

              {payment.token_amount && payment.token_caip19 && (
                <DetailRow label="Crypto received">
                  <View style={styles.cryptoValue}>
                    <ThemedText
                      fontSize={16}
                      lineHeight={18}
                      color="text-primary"
                    >
                      {formatCryptoReceived(
                        payment.token_caip19,
                        payment.token_amount,
                      ) ?? payment.token_amount}
                    </ThemedText>
                    {(() => {
                      const icon = getTokenIcon(payment.token_caip19);
                      return icon ? (
                        <Image style={styles.tokenIcon} source={icon} />
                      ) : null;
                    })()}
                  </View>
                </DetailRow>
              )}

              <DetailRow
                label="Payment ID"
                value={payment.payment_id}
                onPress={handleCopyPaymentId}
                underline
              />

              {payment.tx_hash && (
                <DetailRow
                  label="Hash ID"
                  value={truncateHash(payment.tx_hash)}
                  onPress={handleCopyHash}
                  underline
                />
              )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
      <Toast config={toastConfig} position="bottom" visibilityTime={6000} />
    </Modal>
  );
}

export const TransactionDetailModal = memo(TransactionDetailModalBase);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: BorderRadius["5"],
    borderTopRightRadius: BorderRadius["5"],
    paddingTop: Spacing["spacing-4"],
    paddingBottom: Spacing["spacing-6"],
    paddingHorizontal: Spacing["spacing-5"],
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: Spacing["spacing-4"],
  },
  content: {
    flexGrow: 0,
  },
  details: {
    gap: Spacing["spacing-3"],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing["spacing-6"],
    borderRadius: BorderRadius["3"],
    gap: Spacing["spacing-2"],
  },
  valueText: {
    textAlign: "right",
    flex: 1,
  },
  underlineText: {
    textDecorationLine: "underline",
  },
  closeButton: {
    borderRadius: BorderRadius["3"],
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["spacing-3"],
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  cryptoValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
  },
  tokenIcon: {
    width: 18,
    height: 18,
  },
});
