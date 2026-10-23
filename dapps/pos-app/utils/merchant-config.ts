const DEFAULT_MERCHANT_ID = process.env.EXPO_PUBLIC_DEFAULT_MERCHANT_ID ?? null;
const DEFAULT_CUSTOMER_API_KEY =
  process.env.EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY ?? null;

export const MerchantConfig = {
  getDefaultMerchantId: (): string | null => DEFAULT_MERCHANT_ID,
  getDefaultCustomerApiKey: (): string | null => DEFAULT_CUSTOMER_API_KEY,
  hasEnvDefaults: (): boolean =>
    Boolean(DEFAULT_MERCHANT_ID && DEFAULT_CUSTOMER_API_KEY),
};
