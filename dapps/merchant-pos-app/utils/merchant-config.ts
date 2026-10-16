/**
 * Customer-facing WCPay credentials (the partner-scoped API key).
 *
 * The Merchant-Id is no longer sourced from env — it's the install-bound id
 * of the merchant we created via the pay-core upsert at onboarding finish.
 * See `services/client.ts#getApiHeaders`.
 */
const DEFAULT_CUSTOMER_API_KEY =
  process.env.EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY ?? null;

export const MerchantConfig = {
  getCustomerApiKey: (): string | null => DEFAULT_CUSTOMER_API_KEY,
  hasCustomerApiKey: (): boolean => Boolean(DEFAULT_CUSTOMER_API_KEY),
};
