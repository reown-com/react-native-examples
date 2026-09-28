import { storage } from "@/utils/storage";
import { PaymentRecord } from "@/utils/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PaymentsStore {
  payments: PaymentRecord[];
  addPayment: (payment: PaymentRecord) => void;
  clear: () => void;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const usePaymentsStore = create<PaymentsStore>()(
  persist(
    (set) => ({
      payments: [],
      addPayment: (payment) =>
        set((state) => ({ payments: [payment, ...state.payments] })),
      clear: () => set({ payments: [] }),
    }),
    {
      name: "payments",
      version: 1,
      storage,
    },
  ),
);

/** Only the payments belonging to a given merchant (wallet). */
export function paymentsForMerchant(
  payments: PaymentRecord[],
  merchantAddress: string | null,
): PaymentRecord[] {
  if (!merchantAddress) return [];
  return payments.filter((p) => p.merchantAddress === merchantAddress);
}

/** Sum of succeeded payment cents created today (for the Home "Volume today" stat). */
export function volumeTodayCents(payments: PaymentRecord[]): number {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const start = startOfDay.getTime();
  return payments
    .filter((p) => p.status === "succeeded" && p.createdAt >= start)
    .reduce((sum, p) => sum + p.amountCents, 0);
}

/** Count of succeeded payments created today. */
export function countToday(payments: PaymentRecord[]): number {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const start = startOfDay.getTime();
  return payments.filter(
    (p) => p.status === "succeeded" && p.createdAt >= start,
  ).length;
}

export const PAYMENT_LINK_VALIDITY_MS = 10 * MS_PER_DAY;
