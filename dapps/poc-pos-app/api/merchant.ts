import { useLogsStore } from "@/store/useLogsStore";
import { merchantClient } from "./client";

export type MerchantAccounts = {
  liquidationAddress: string | null;
  solanaLiquidationAddress: string | null;
};

/**
 * Get the merchant accounts for a given merchant ID
 * @param merchantId - The ID of the merchant to get the accounts for
 * @returns The merchant accounts
 */
export async function getMerchantAccounts(
  merchantId: string,
): Promise<MerchantAccounts | null> {
  try {
    const normalizedMerchantId = merchantId?.trim();
    if (!normalizedMerchantId) {
      throw new Error("merchantId is required");
    }

    const data = await merchantClient.get<MerchantAccounts>(
      `/merchants/${encodeURIComponent(normalizedMerchantId)}/accounts`,
    );

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    useLogsStore
      .getState()
      .addLog(
        "error",
        `${errorMessage} for merchant ${merchantId}`,
        "merchant",
        "getMerchantAccounts",
      );
    return null;
  }
}
