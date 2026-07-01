// Dynamic Expo config — selects the build variant via the APP_VARIANT env var.
//
//   APP_VARIANT=production (default) -> com.walletconnect.web3wallet.rnsample
//   APP_VARIANT=internal             -> ...rnsample.internal   (CI distribution)
//   APP_VARIANT=debug                -> ...rnsample.debug       (local dev)
//
// Per variant this overrides the native applicationId / bundleIdentifier and
// the app icon (reusing the icons extracted from the committed native projects
// into assets/icons/<variant>/). Expo loads the static config from app.json and
// passes it here as `config`.
//
// Splash screen is handled separately by the react-native-bootsplash plugin
// (assets/bootsplash/), configured in app.json.
//
// Deep-link schemes are variant-specific and MUST be registered natively here,
// otherwise the OS has no app to open when a dApp deep-links back to an
// internal/debug build. src/utils/misc.ts advertises these exact schemes as the
// WalletConnect redirect (rn-web3wallet-internal:// etc.), so app.json's single
// base `scheme` is not enough once we prebuild — each variant registers its own.

const BASE_APP_ID = 'com.walletconnect.web3wallet.rnsample';
const BASE_SCHEME = 'rn-web3wallet';
const WALLETKIT_PATH = '/rn_walletkit';

const VARIANT_ID_SUFFIX = {
  production: '',
  internal: '.internal',
  debug: '.debug',
};

// Native custom-scheme suffix advertised as the WalletConnect redirect
// (see src/utils/misc.ts ENV_CONFIG.native).
const VARIANT_SCHEME_SUFFIX = {
  production: '',
  internal: '-internal',
  debug: '-debug',
};

// Universal-link path suffix (see src/utils/misc.ts ENV_CONFIG.universal).
// Applied to Android intent filters; iOS path matching is server-side via the
// apple-app-site-association file, so associatedDomains stay variant-agnostic.
const VARIANT_LINK_SUFFIX = {
  production: '',
  internal: '_internal',
  debug: '_debug',
};

module.exports = ({ config }) => {
  const variant =
    process.env.APP_VARIANT in VARIANT_ID_SUFFIX
      ? process.env.APP_VARIANT
      : 'production';
  const iconDir = `./assets/icons/${variant}`;
  const variantScheme = `${BASE_SCHEME}${VARIANT_SCHEME_SUFFIX[variant]}`;
  const variantWalletkitPath = `${WALLETKIT_PATH}${VARIANT_LINK_SUFFIX[variant]}`;

  return {
    ...config,
    icon: `${iconDir}/icon.png`,
    // Register the variant-specific redirect scheme so deep-link-back works
    // (rn-web3wallet-internal:// for internal, rn-web3wallet-debug:// for debug).
    scheme: variantScheme,
    ios: {
      ...config.ios,
      // iOS variants = per-variant prebuild driven by APP_VARIANT.
      bundleIdentifier: `${BASE_APP_ID}${VARIANT_ID_SUFFIX[variant]}`,
    },
    android: {
      ...config.android,
      // Android keeps the base id here; the `.internal` suffix is applied by the
      // Gradle `internal` buildType (plugins/withAndroidVariants.js) so the
      // existing assembleInternal/assembleRelease CI flow works unchanged.
      package: BASE_APP_ID,
      adaptiveIcon: {
        foregroundImage: `${iconDir}/adaptive-foreground.png`,
        backgroundImage: `${iconDir}/adaptive-background.png`,
        monochromeImage: `${iconDir}/adaptive-monochrome.png`,
      },
      // Rewrite the /rn_walletkit universal-link path prefix to the variant path
      // so internal/debug App Links (…/rn_walletkit_internal) resolve. No-op for
      // production (empty suffix).
      intentFilters: config.android.intentFilters?.map(filter => ({
        ...filter,
        data: filter.data?.map(entry =>
          entry.pathPrefix === WALLETKIT_PATH
            ? { ...entry, pathPrefix: variantWalletkitPath }
            : entry,
        ),
      })),
    },
  };
};
