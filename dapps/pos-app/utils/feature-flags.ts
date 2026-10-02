// NFC/HCE tap-to-pay kill-switch. Baked into the JS bundle at build time.
// The native side is gated by the matching <meta-data> injected by
// plugins/withHceFeatureFlag.js. Set EXPO_PUBLIC_NFC_HCE_ENABLED="true" to enable.
export const isNfcHceEnabled =
  process.env.EXPO_PUBLIC_NFC_HCE_ENABLED === "true";
