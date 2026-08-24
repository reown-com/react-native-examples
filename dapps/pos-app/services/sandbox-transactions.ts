import { getCurrency } from "@/utils/currency";
import { PaymentRecord, TransactionsResponse } from "@/utils/types";
import { useSettingsStore } from "@/store/useSettingsStore";

export interface SandboxTransactionsOptions {
  status?: string | string[];
  limit?: number;
  cursor?: string;
  startTs?: string;
  endTs?: string;
}

/**
 * Returns local records for the sandbox transaction screen. This deliberately
 * lives below the platform-specific transaction services so native and web
 * builds have identical, request-free sandbox behavior.
 */
export function getSandboxTransactions(
  options: SandboxTransactionsOptions = {},
): TransactionsResponse {
  const currency = getCurrency(useSettingsStore.getState().currency);
  const now = Date.now();
  const statuses = options.status
    ? new Set(Array.isArray(options.status) ? options.status : [options.status])
    : null;

  const records: PaymentRecord[] = [
    "requires_action",
    "processing",
    "succeeded",
    "failed",
    "expired",
    "cancelled",
  ].map((status, index) => {
    const createdAt = new Date(now - index * 60_000).toISOString();
    const isTerminal = status !== "requires_action" && status !== "processing";

    return {
      paymentId: `sandbox_${status}`,
      merchantId: "sandbox",
      referenceId: `sandbox-reference-${status}`,
      status: status as PaymentRecord["status"],
      isTerminal,
      fiatAmount: {
        value: String((index + 1) * 100),
        unit: currency.unit,
      },
      tokenAmount: {
        value: String((index + 1) * 1000000),
        unit: "eip155:8453/slip44:60",
        display: {
          formatted: `${index + 1}.00`,
          assetSymbol: "USDC",
          decimals: 6,
          networkName: "Base",
        },
      },
      transaction:
        status === "succeeded"
          ? { hash: "0xsandboxtransactionhash" }
          : undefined,
      createdAt,
      lastUpdatedAt: createdAt,
      settledAt: status === "succeeded" ? createdAt : undefined,
    };
  });

  const start = options.startTs ? Date.parse(options.startTs) : undefined;
  const end = options.endTs ? Date.parse(options.endTs) : undefined;
  const filtered = records.filter((record) => {
    if (statuses && !statuses.has(record.status)) return false;
    const createdAt = Date.parse(record.createdAt ?? "");
    if (start !== undefined && createdAt < start) return false;
    if (end !== undefined && createdAt > end) return false;
    return true;
  });

  return {
    data: options.limit ? filtered.slice(0, options.limit) : filtered,
    stats: {
      totalTransactions: filtered.length,
      totalCustomers: filtered.length,
      totalRevenue: [
        {
          amount: filtered.reduce(
            (total, record) => total + Number(record.fiatAmount?.value ?? 0),
            0,
          ),
          currency: currency.code,
        },
      ],
    },
    nextCursor: null,
  };
}
