import { amountToCents, getCurrency } from "@/utils/currency";
import { PaymentRecord, TransactionStatus } from "@/utils/types";
import { create } from "zustand";
import { useSettingsStore } from "./useSettingsStore";

// Keeps the list short: Test Mode is a demo, not a ledger.
const MAX_TEST_PAYMENTS = 50;

/** Outcomes a Test Mode payment can end in on the scan screen. */
export type TestPaymentOutcome = Extract<
  TransactionStatus,
  "succeeded" | "failed" | "expired" | "cancelled"
>;

interface TestPaymentsStore {
  payments: PaymentRecord[];
  addTestPayment: (input: {
    paymentId: string;
    amount: string;
    status: TestPaymentOutcome;
  }) => void;
  clear: () => void;
}

// Transient (non-persisted) record of the payments taken in Test Mode this
// session, so the Transactions screen shows the payment the merchant just ran
// next to the sample rows. Nothing here reaches the API.
export const useTestPaymentsStore = create<TestPaymentsStore>((set) => ({
  payments: [],
  addTestPayment: ({ paymentId, amount, status }) => {
    const currency = getCurrency(useSettingsStore.getState().currency);
    const cents = amountToCents(amount);
    const now = new Date().toISOString();
    const record: PaymentRecord = {
      paymentId,
      merchantId: "test",
      referenceId: `test-reference-${paymentId}`,
      status,
      isTerminal: true,
      fiatAmount: { value: String(cents), unit: currency.unit },
      tokenAmount: {
        value: String(cents * 10_000),
        unit: "eip155:8453/slip44:60",
        display: {
          formatted: (cents / 100).toFixed(2),
          assetSymbol: "USDC",
          decimals: 6,
          networkName: "Base",
        },
      },
      transaction:
        status === "succeeded" ? { hash: "0xtesttransactionhash" } : undefined,
      createdAt: now,
      lastUpdatedAt: now,
      settledAt: status === "succeeded" ? now : undefined,
    };

    set((state) => ({
      payments: [
        record,
        ...state.payments.filter((p) => p.paymentId !== paymentId),
      ].slice(0, MAX_TEST_PAYMENTS),
    }));
  },
  clear: () => set({ payments: [] }),
}));
