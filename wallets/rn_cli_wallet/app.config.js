// Dynamic Expo config — selects the build variant via the APP_VARIANT env var.
//
//   APP_VARIANT=production (default) -> com.walletconnect.web3wallet.rnsample
//   APP_VARIANT=internal             -> ...rnsample.internal   (CI distribution)
//   APP_VARIANT=debug                -> ...rnsample.debug       (local dev)
//
// Expo loads the static config from app.json and passes it here as `config`;
// this function only overrides the per-variant native identifiers. It is
// consumed by `expo prebuild` / `expo run` to set the iOS bundleIdentifier and
// Android applicationId.
//
// NOTE: while the committed ios/ and android/ projects are still authoritative
// (pre-prebuild), today's builds continue to use the Xcode schemes / Gradle
// buildTypes; this file only takes effect once we switch to `expo prebuild`.
// TODO (icon assets step): give internal/debug their own AppIcon-Internal /
// AppIcon-Debug equivalents via per-variant `icon`.

const BASE_APP_ID = 'com.walletconnect.web3wallet.rnsample';

const VARIANT_ID_SUFFIX = {
  production: '',
  internal: '.internal',
  debug: '.debug',
};

module.exports = ({ config }) => {
  const variant = process.env.APP_VARIANT || 'production';
  const idSuffix = VARIANT_ID_SUFFIX[variant] ?? '';
  const appId = `${BASE_APP_ID}${idSuffix}`;

  return {
    ...config,
    ios: {
      ...config.ios,
      bundleIdentifier: appId,
    },
    android: {
      ...config.android,
      package: appId,
    },
  };
};
