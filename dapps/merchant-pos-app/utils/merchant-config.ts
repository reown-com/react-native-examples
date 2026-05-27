/**
 * WCPay credentials for the payment rail.
 *
 * In V1 the merchant identity is the locally-onboarded wallet, but the WCPay
 * API authenticates with a server-side Merchant-Id + Api-Key. Until a
 * wallet-based merchant onboarding API exists, these come from env and act as
 * the bridge between the local identity and the real payment gateway.
 */
const DEFAULT_MERCHANT_ID = process.env.EXPO_PUBLIC_DEFAULT_MERCHANT_ID ?? null;
const DEFAULT_CUSTOMER_API_KEY =
  process.env.EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY ?? null;

export const MerchantConfig = {
  getMerchantId: (): string | null => DEFAULT_MERCHANT_ID,
  getCustomerApiKey: (): string | null => DEFAULT_CUSTOMER_API_KEY,
  hasPaymentCredentials: (): boolean =>
    Boolean(DEFAULT_MERCHANT_ID && DEFAULT_CUSTOMER_API_KEY),
};
