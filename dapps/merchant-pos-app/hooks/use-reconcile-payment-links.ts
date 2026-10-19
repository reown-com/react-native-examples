import { getPaymentStatus } from "@/services/payment";
import { useMerchantStore } from "@/store/useMerchantStore";
import { usePaymentLinksStore } from "@/store/usePaymentLinksStore";
import { usePaymentsStore } from "@/store/usePaymentsStore";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

const POLL_INTERVAL_MS = 5000;

/**
 * Payment links create a WCPay payment up front but, unlike the POS checkout,
 * nothing polls them — so a paid link never lands in the payments store and is
 * missing from Activity / Volume. This hook reconciles that: while the calling
 * screen is focused, it polls every not-yet-recorded link for this merchant and
 *  - on `succeeded`: appends a PaymentRecord (stamped now, so it counts toward
 *    today's volume when detected) and marks the link recorded;
 *  - on any other final state (failed/expired/cancelled): marks it recorded so
 *    we stop polling;
 *  - otherwise: stores the latest status and keeps polling.
 */
export function useReconcilePaymentLinks() {
  const runningRef = useRef(false);

  const reconcile = useCallback(async () => {
    if (runningRef.current) return;
    const activeAddress = useMerchantStore.getState().activeAddress;
    if (!activeAddress) return;

    const pending = usePaymentLinksStore
      .getState()
      .links.filter(
        (l) =>
          l.merchantAddress === activeAddress && l.paymentId && !l.recorded,
      );
    if (pending.length === 0) return;

    runningRef.current = true;
    try {
      const { updateLink } = usePaymentLinksStore.getState();
      const { addPayment } = usePaymentsStore.getState();

      for (const link of pending) {
        try {
          const res = await getPaymentStatus(link.paymentId!);
          if (res.status === "succeeded") {
            addPayment({
              id: uuidv4(),
              merchantAddress: link.merchantAddress,
              paymentId: link.paymentId!,
              amountCents: link.amountCents,
              currency: link.currency,
              status: "succeeded",
              createdAt: Date.now(),
            });
            updateLink(link.id, { status: "succeeded", recorded: true });
          } else if (res.isFinal) {
            // failed / expired / cancelled — stop polling this link.
            updateLink(link.id, { status: res.status, recorded: true });
          } else {
            updateLink(link.id, { status: res.status });
          }
        } catch {
          // Transient error — leave the link pending and retry next tick.
        }
      }
    } finally {
      runningRef.current = false;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reconcile();
      const id = setInterval(reconcile, POLL_INTERVAL_MS);
      return () => clearInterval(id);
    }, [reconcile]),
  );
}
