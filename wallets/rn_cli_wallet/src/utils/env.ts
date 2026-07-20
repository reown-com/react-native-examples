/**
 * Public environment variables.
 *
 * These use Expo's `EXPO_PUBLIC_` prefix, which Expo inlines into the JS bundle
 * at build time (replacing react-native-config). Values come from the `.env`
 * file (auto-loaded by the Expo CLI) and are **public** — they are embedded in
 * the shipped bundle, so never put real secrets here.
 *
 * Note: `process.env.EXPO_PUBLIC_*` must be referenced statically (as written
 * below) for the inlining to work — do not access them dynamically.
 */
export const ENV = {
  PROJECT_ID: process.env.EXPO_PUBLIC_PROJECT_ID ?? '',
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  TON_CENTER_API_KEY: process.env.EXPO_PUBLIC_TON_CENTER_API_KEY,
  BLOCKCHAIN_API_URL: process.env.EXPO_PUBLIC_BLOCKCHAIN_API_URL ?? '',
  TEST_PRIVATE_KEY: process.env.EXPO_PUBLIC_TEST_PRIVATE_KEY,
  TEST_MODE: process.env.EXPO_PUBLIC_TEST_MODE,
  PAY_API_BASE_URL: process.env.EXPO_PUBLIC_PAY_API_BASE_URL,
  // Dapp Picker POC (H2b)
  FEE_RECIPIENT_SOLANA: process.env.EXPO_PUBLIC_FEE_RECIPIENT_SOLANA,
  FEE_RECIPIENT_EVM: process.env.EXPO_PUBLIC_FEE_RECIPIENT_EVM,
  FEE_BPS: process.env.EXPO_PUBLIC_FEE_BPS,
  PICKER_DAPP_URL: process.env.EXPO_PUBLIC_PICKER_DAPP_URL,
};
