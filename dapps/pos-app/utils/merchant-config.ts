const DEFAULT_MERCHANT_ID = process.env.EXPO_PUBLIC_DEFAULT_MERCHANT_ID ?? null;
const DEFAULT_PARTNER_API_KEY =
  process.env.EXPO_PUBLIC_DEFAULT_PARTNER_API_KEY ?? null;

export const MerchantConfig = {
  getDefaultMerchantId: (): string | null => DEFAULT_MERCHANT_ID,
  getDefaultPartnerApiKey: (): string | null => DEFAULT_PARTNER_API_KEY,
  hasEnvDefaults: (): boolean =>
    Boolean(DEFAULT_MERCHANT_ID && DEFAULT_PARTNER_API_KEY),
};
