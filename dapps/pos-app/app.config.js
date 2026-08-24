// Dynamic Expo config — selects the build variant via the APP_VARIANT env var.
//
//   APP_VARIANT=production (default) -> com.reown.mobilepos          "WalletConnect Pay"
//   APP_VARIANT=internal             -> com.reown.mobilepos.internal "WPay Dev"  (local dev + TestFlight/Firebase)
//
// The variant is named `internal` end-to-end (buildType, CI release-type, gradle
// assembleInternal) to match wallets/rn_cli_wallet and the shared reusable release
// workflows, which special-case the literal string `internal`. The only user-facing
// difference is the display name "WPay Dev" and a badged icon. Expo loads the static
// config from app.json and passes it here as `config`.
//
// Android note: the `.internal` applicationId suffix + badged launcher icon + app
// label are applied by the Gradle `internal` buildType (plugins/withAndroidVariants.js
// and plugins/withAndroidVariantIcons.js), NOT here, so the assembleInternal /
// assembleRelease CI flow works from a single production prebuild. This config only
// drives the iOS variant (per-variant prebuild via APP_VARIANT) and the production
// Android prebuild defaults.

const BASE_APP_ID = "com.reown.mobilepos";
const BASE_SCHEME = "wpay";

const VARIANT_ID_SUFFIX = {
  production: "",
  internal: ".internal",
};

const VARIANT_SCHEME_SUFFIX = {
  production: "",
  internal: "-internal",
};

// Human-readable display name per variant (iOS CFBundleDisplayName via `name`; the
// Android label is overlaid per-buildType via plugins/withAndroidVariantIcons.js
// strings.xml). Production is the WalletConnect Pay rebrand; internal stays "WPay Dev".
const VARIANT_NAME = {
  production: "WalletConnect Pay",
  internal: "WPay Dev",
};

module.exports = ({ config }) => {
  const variant =
    process.env.APP_VARIANT in VARIANT_ID_SUFFIX
      ? process.env.APP_VARIANT
      : "production";
  const iconDir = `./assets/icons/${variant}`;

  return {
    ...config,
    name: VARIANT_NAME[variant],
    icon: `${iconDir}/icon.png`,
    scheme: `${BASE_SCHEME}${VARIANT_SCHEME_SUFFIX[variant]}`,
    ios: {
      ...config.ios,
      bundleIdentifier: `${BASE_APP_ID}${VARIANT_ID_SUFFIX[variant]}`,
    },
    android: {
      ...config.android,
      // Keep the base id here; the `.internal` suffix is applied by the Gradle
      // `internal` buildType so the existing assembleInternal/assembleRelease CI
      // flow works unchanged.
      package: BASE_APP_ID,
      adaptiveIcon: {
        ...config.android?.adaptiveIcon,
        foregroundImage: `${iconDir}/adaptive-foreground.png`,
        backgroundImage: `${iconDir}/adaptive-background.png`,
        monochromeImage: `${iconDir}/adaptive-monochrome.png`,
      },
    },
  };
};
