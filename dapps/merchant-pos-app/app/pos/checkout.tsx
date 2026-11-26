import { CloseIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/primary-button";
import QrCode from "@/components/qr-code";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { formatCountdown, useCountdown } from "@/hooks/use-countdown";
import { useTheme } from "@/hooks/use-theme-color";
import { usePaymentStatus, useStartPayment } from "@/services/hooks";
import { useMerchantStore } from "@/store/useMerchantStore";
import { usePaymentsStore } from "@/store/usePaymentsStore";
import { formatCentsWithSymbol, getCurrency } from "@/utils/currency";
import { showToast } from "@/utils/toast";
import { PaymentStatus } from "@/utils/types";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { cancelPayment } from "@/services/payment";
import { generateReferenceId } from "@/utils/id";

const FIFTEEN_MIN_S = 15 * 60;

export default function CheckoutScreen() {
  const Theme = useTheme();
  const params = useLocalSearchParams<{
    amountCents: string;
    currency: string;
  }>();
  const amountCents = Number(params.amountCents ?? 0);
  const currencyCode = params.currency ?? "USD";
  const currency = getCurrency(currencyCode);

  const startPayment = useStartPayment();
  const addPayment = usePaymentsStore((s) => s.addPayment);
  const activeAddress = useMerchantStore((s) => s.activeAddress);

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [gatewayUrl, setGatewayUrl] = useState<string | undefined>();
  const [expiresAtS, setExpiresAtS] = useState<number | null>(null);
  const startedRef = useRef(false);
  const terminalRef = useRef(false);

  // Kick off the payment once on mount.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startPayment.mutate(
      {
        referenceId: generateReferenceId(),
        amount: { value: String(amountCents), unit: currency.unit },
      },
      {
        onSuccess: (res) => {
          setPaymentId(res.paymentId);
          setGatewayUrl(res.gatewayUrl);
          setExpiresAtS(
            res.expiresAt ?? Math.floor(Date.now() / 1000) + FIFTEEN_MIN_S,
          );
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTerminal = (status: PaymentStatus) => {
    if (terminalRef.current) return;
    terminalRef.current = true;
    addPayment({
      id: uuidv4(),
      merchantAddress: activeAddress ?? "",
      paymentId: paymentId ?? "",
      amountCents,
      currency: currencyCode,
      status,
      createdAt: Date.now(),
    });
    if (status === "succeeded") {
      router.replace({
        pathname: "/pos/success",
        params: {
          amountCents: String(amountCents),
          currency: currencyCode,
        },
      });
    } else {
      router.replace({
        pathname: "/pos/cancelled",
        params: { reason: status },
      });
    }
  };

  usePaymentStatus(paymentId, {
    enabled: !!paymentId,
    onTerminalState: (data) => goTerminal(data.status),
  });

  const { remainingSeconds, isExpired } = useCountdown({
    expiresAt: expiresAtS,
    onExpired: () => goTerminal("expired"),
  });
  void isExpired;

  const onCancel = async () => {
    if (terminalRef.current) return;
    terminalRef.current = true;
    if (paymentId) {
      try {
        await cancelPayment(paymentId);
      } catch {
        // Cancellation may 400 if already processing — fall through to the UI anyway.
      }
    }
    router.replace({
      pathname: "/pos/cancelled",
      params: { reason: "cancelled" },
    });
  };

  const onCopy = async () => {
    if (!gatewayUrl) return;
    await Clipboard.setStringAsync(gatewayUrl);
    showToast("Copied!");
  };

  const error = startPayment.error;

  return (
    <Screen>
      <ScreenHeader
        title="Awaiting payment"
        right={
          <Pressable
            onPress={onCancel}
            hitSlop={8}
            style={[
              styles.closeBtn,
              {
                backgroundColor: Theme["foreground-primary"],
                borderColor: Theme["border-primary"],
              },
            ]}
          >
            <CloseIcon size={16} color={Theme["text-primary"]} />
          </Pressable>
        }
      />

      <View style={styles.content}>
        {error ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: Theme["foreground-primary"],
                borderColor: Theme["border-primary"],
              },
            ]}
          >
            <ThemedText weight="500" style={styles.errorTitle}>
              Couldn&apos;t create payment
            </ThemedText>
            <ThemedText color="text-secondary" style={styles.errorBody}>
              {error.message}
            </ThemedText>
            <PrimaryButton
              label="Back"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>
        ) : (
          <>
            <View
              style={[
                styles.qrBox,
                {
                  backgroundColor: Theme["foreground-primary"],
                  borderColor: Theme["border-primary"],
                },
              ]}
            >
              <View style={styles.qrInner}>
                <QrCode size={232} uri={gatewayUrl}>
                  <Image
                    source={require("@/assets/images/wc_logo_dark.png")}
                    style={qrLogoStyle}
                    contentFit="cover"
                  />
                </QrCode>
              </View>
              <ThemedText weight="500" style={styles.qrAmount}>
                {formatCentsWithSymbol(amountCents, currencyCode)}
              </ThemedText>
              <ThemedText color="text-secondary" style={styles.qrSub}>
                Scan to pay with any wallet
              </ThemedText>
              <View style={styles.waitingRow}>
                <ActivityIndicator
                  size="small"
                  color={Theme["icon-accent-primary"]}
                />
                <ThemedText color="text-secondary" style={styles.waitingText}>
                  {gatewayUrl
                    ? `Waiting for payment… ${formatCountdown(remainingSeconds)}`
                    : "Creating payment…"}
                </ThemedText>
              </View>
            </View>

            {gatewayUrl ? (
              <View
                style={[
                  styles.linkRow,
                  {
                    backgroundColor: Theme["foreground-primary"],
                    borderColor: Theme["border-primary"],
                  },
                ]}
              >
                <View style={styles.flex}>
                  <ThemedText color="text-secondary" style={styles.linkLabel}>
                    Payment link
                  </ThemedText>
                  <ThemedText
                    weight="500"
                    numberOfLines={1}
                    style={styles.linkUrl}
                  >
                    {gatewayUrl}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={onCopy}
                  style={[
                    styles.copyBtn,
                    { backgroundColor: Theme["foreground-secondary"] },
                  ]}
                >
                  <ThemedText weight="500" color="text-accent-primary">
                    Copy
                  </ThemedText>
                </Pressable>
              </View>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}

const qrLogoStyle = { width: 44, height: 44, borderRadius: 22 } as const;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing["spacing-6"],
    justifyContent: "center",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius["3"],
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  qrBox: {
    alignItems: "center",
    borderRadius: BorderRadius["7"],
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing["spacing-6"],
  },
  qrInner: {
    backgroundColor: "#fff",
    borderRadius: BorderRadius["4"],
    padding: Spacing["spacing-3"],
    marginBottom: Spacing["spacing-4"],
  },
  qrAmount: {
    fontSize: 28,
    marginBottom: 4,
  },
  qrSub: {
    fontSize: 13,
    marginBottom: Spacing["spacing-3"],
  },
  waitingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  waitingText: {
    fontSize: 12,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing["spacing-3"],
    borderRadius: BorderRadius["4"],
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing["spacing-4"],
    marginTop: Spacing["spacing-4"],
  },
  flex: { flex: 1 },
  linkLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  linkUrl: {
    fontSize: 13,
  },
  copyBtn: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  errorCard: {
    borderRadius: BorderRadius["5"],
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing["spacing-6"],
    gap: Spacing["spacing-4"],
  },
  errorTitle: {
    fontSize: 18,
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
