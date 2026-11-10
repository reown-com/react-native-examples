// Expo config plugin: sets `android.enableMinifyInReleaseBuilds` in the
// prebuild-generated android/gradle.properties.
//
// Why: Expo SDK 58's template turns R8 on for release builds by default
// (SDK 56 left it off). With R8 on, assembleRelease fails with
// "Missing class java.awt.Component (referenced from com.sun.jna.Native...)":
// @walletconnect/react-native-compat pulls in JNA for the WalletConnect Pay
// (yttrium) uniffi bindings, and both JNA and uniffi resolve classes by
// reflection, so making R8 work needs keep rules that have to be verified
// against the Pay flow at runtime, not just a -dontwarn. Until that's done,
// keep the pre-SDK-58 behaviour:
//   ["./plugins/withAndroidReleaseMinify.js", { "enabled": false }]
const { withGradleProperties } = require('@expo/config-plugins');

const KEY = 'android.enableMinifyInReleaseBuilds';

function setMinify(properties, enabled) {
  const value = String(Boolean(enabled));
  const existing = properties.find(
    item => item.type === 'property' && item.key === KEY,
  );
  if (existing) {
    existing.value = value;
  } else {
    properties.push({ type: 'property', key: KEY, value });
  }
  return properties;
}

const withAndroidReleaseMinify = (config, { enabled = false } = {}) =>
  withGradleProperties(config, cfg => {
    cfg.modResults = setMinify(cfg.modResults, enabled);
    return cfg;
  });

module.exports = withAndroidReleaseMinify;
// Exported for unit testing the transform in isolation.
module.exports.setMinify = setMinify;
