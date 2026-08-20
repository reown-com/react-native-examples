import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { formatFiatAmount, formatTokenAmount } from "@/utils/currency";
import { formatDateTime } from "@/utils/misc";
import { PaymentRecord } from "@/utils/types";
import { memo, useEffect } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  useSafeAreaInsets,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Pressable as ScalePressable } from "./pressable";
import { FramedModal } from "./framed-modal";
import { StatusBadge } from "./status-badge";
import { ThemedText } from "./themed-text";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { showSuccessToast } from "@/utils/toast";
import { toastConfig } from "@/utils/toasts";
import Toast from "react-native-toast-message";

const ANIMATION_DURATION = 200;
const EASING = Easing.inOut(Easing.ease);

interface TransactionDetailModalProps {
  visible: boolean;
  payment: PaymentRecord | null;
  onClose: () => void;
}

/**
 * Truncate a developer-facing id in the middle (e.g., "0x23...22d3"). Used for
 * transaction hashes and payment ids so long values stay a single short line.
 */
function truncateMiddle(value?: string, lead = 4, trail = 4): string {
  if (!value) return "-";
  if (value.length <= lead + trail + 3) return value;
  return `${value.slice(0, lead)}...${value.slice(-trail)}`;
}

function formatTokenAmountLabel(
  tokenAmount: NonNullable<PaymentRecord["tokenAmount"]>,
): string {
  const { value, display } = tokenAmount;
  const symbol = display?.assetSymbol;

  let amount = display?.formatted;
  if (!amount && value) {
    amount =
      display?.decimals != null
        ? formatTokenAmount(value, display.decimals)
        : value;
  }

  if (!amount) return symbol ?? "";
  return symbol ? `${amount} ${symbol}` : amount;
}

interface DetailRowProps {
  label: string;
  value?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}

function DetailRow({ label, value, children, onPress }: DetailRowProps) {
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
          style={styles.valueText}
        >
          {value}
        </ThemedText>
      )}
    </View>
  );

  if (onPress) {
    return <ScalePressable onPress={onPress}>{content}</ScalePressable>;
  }

  return content;
}

/**
 * Developer-facing id value: monospaced (KH Teka Mono) + a copy affordance.
 * The row's onPress performs the copy; this only renders the value + icon.
 */
function CopyableId({ value }: { value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.copyValue}>
      <ThemedText
        fontSize={16}
        lineHeight={18}
        color="text-primary"
        numberOfLines={1}
        style={styles.monoValue}
      >
        {value}
      </ThemedText>
      <Image
        source={require("@/assets/images/copy.png")}
        tintColor={theme["icon-invert"]}
        contentFit="contain"
        style={styles.copyIcon}
      />
    </View>
  );
}

function TransactionDetailModalBase({
  visible,
  payment,
  onClose,
}: TransactionDetailModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(Platform.OS === "web" ? 300 : 0);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (visible) {
      translateY.value = withTiming(0, {
        duration: ANIMATION_DURATION,
        easing: EASING,
      });
    } else {
      translateY.value = withTiming(300, {
        duration: ANIMATION_DURATION,
        easing: EASING,
      });
    }
  }, [visible, translateY]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!payment) return null;

  const handleCopyPaymentId = async () => {
    if (!payment?.paymentId) return;
    await Clipboard.setStringAsync(payment.paymentId);
    showSuccessToast("Payment ID copied");
  };

  const txHash = payment.transaction?.hash;
  const handleCopyHash = async () => {
    if (!txHash) return;
    await Clipboard.setStringAsync(txHash);
    showSuccessToast("Transaction ID copied");
  };

  return (
    <FramedModal visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: theme["bg-primary"] },
            sheetAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.containerInner,
              {
                paddingBottom: Math.max(insets.bottom, Spacing["spacing-6"]),
              },
            ]}
          >
            <View style={styles.header}>
              <ScalePressable
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
              </ScalePressable>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.details}>
                <DetailRow
                  label="Date"
                  value={formatDateTime(payment.createdAt)}
                />

                <DetailRow label="Status">
                  <StatusBadge status={payment.status} />
                </DetailRow>

                <DetailRow
                  label="Amount"
                  value={formatFiatAmount(
                    payment.fiatAmount?.value,
                    payment.fiatAmount?.unit,
                  )}
                />

                {payment.tokenAmount?.value && (
                  <DetailRow label="Asset received">
                    <View style={styles.cryptoValue}>
                      <ThemedText
                        fontSize={16}
                        lineHeight={18}
                        color="text-primary"
                      >
                        {formatTokenAmountLabel(payment.tokenAmount)}
                      </ThemedText>
                      {payment.tokenAmount.display?.iconUrl && (
                        <Image
                          style={styles.tokenIcon}
                          source={{ uri: payment.tokenAmount.display.iconUrl }}
                        />
                      )}
                    </View>
                  </DetailRow>
                )}

                <DetailRow label="Payment ID" onPress={handleCopyPaymentId}>
                  <CopyableId value={truncateMiddle(payment.paymentId)} />
                </DetailRow>

                {txHash && (
                  <DetailRow label="Transaction ID" onPress={handleCopyHash}>
                    <CopyableId value={truncateMiddle(txHash)} />
                  </DetailRow>
                )}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
      <Toast
        config={toastConfig}
        position="top"
        topOffset={(initialWindowMetrics?.insets.top ?? 0) + 8}
        visibilityTime={2000}
      />
    </FramedModal>
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
    maxHeight: "80%",
  },
  containerInner: {
    paddingTop: Spacing["spacing-4"],
    paddingBottom: Spacing["spacing-6"],
    paddingHorizontal: Spacing["spacing-5"],
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
  copyValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-2"],
    flexShrink: 1,
  },
  monoValue: {
    fontFamily: "KH Teka Mono",
    textAlign: "right",
  },
  copyIcon: {
    width: 18,
    height: 18,
  },
});
