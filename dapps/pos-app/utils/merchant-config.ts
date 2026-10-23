// TODO: Remove once the production env file (POS_ENV_FILE) no longer sets
// EXPO_PUBLIC_DEFAULT_MERCHANT_ID=pos-demo-1. That merchant's API key was
// revoked (the API answers 401 invalid_api_key on every call), so seeding it
// only leaves new installs with credentials that can't work. We can't edit
// that secret right now, so ignore these defaults at runtime instead; the
// merchant enters working credentials in Settings.
const REVOKED_DEFAULT_MERCHANT_ID = "pos-demo-1";

const ENV_MERCHANT_ID = process.env.EXPO_PUBLIC_DEFAULT_MERCHANT_ID ?? null;
const USE_ENV_DEFAULTS =
  ENV_MERCHANT_ID?.trim() !== REVOKED_DEFAULT_MERCHANT_ID;

const DEFAULT_MERCHANT_ID = USE_ENV_DEFAULTS ? ENV_MERCHANT_ID : null;
const DEFAULT_CUSTOMER_API_KEY = USE_ENV_DEFAULTS
  ? (process.env.EXPO_PUBLIC_DEFAULT_CUSTOMER_API_KEY ?? null)
  : null;

export const MerchantConfig = {
  getDefaultMerchantId: (): string | null => DEFAULT_MERCHANT_ID,
  getDefaultCustomerApiKey: (): string | null => DEFAULT_CUSTOMER_API_KEY,
  hasEnvDefaults: (): boolean =>
    Boolean(DEFAULT_MERCHANT_ID && DEFAULT_CUSTOMER_API_KEY),
};
