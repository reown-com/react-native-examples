// Dynamic Expo config — selects the build variant via the APP_VARIANT env var.
//
//   APP_VARIANT=production (default) -> com.walletconnect.web3modal.rnsample
//   APP_VARIANT=internal             -> ...rnsample.internal   (CI distribution)
//   APP_VARIANT=debug                -> ...rnsample.debug       (local dev)
//
// Per variant this overrides the native iOS bundleIdentifier and the deep-link
// scheme. Expo loads the static config from app.json and passes it here as
// `config`.
//
// Deep-link schemes are variant-specific and MUST be registered natively here,
// otherwise the OS has no app to open when a wallet deep-links back to an
// internal/debug build. src/utils/misc.ts advertises these exact schemes as the
// AppKit redirect (w3mwagmisample-internal:// etc.), so app.json's single base
// `scheme` is not enough once we prebuild — each variant registers its own.
//
// Android keeps the base package here; the `.internal`/`.debug` suffixes are
// applied by the Gradle buildTypes (plugins/withAndroidVariants.js) so the
// existing assembleInternal/assembleRelease CI flow works unchanged.

const BASE_APP_ID = 'com.walletconnect.web3modal.rnsample';
const BASE_SCHEME = 'w3mwagmisample';
const APPKIT_PATH = '/rn_appkit';

const VARIANT_ID_SUFFIX = {
  production: '',
  internal: '.internal',
  debug: '.debug',
};

// Native custom-scheme suffix advertised as the AppKit redirect
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
  const variantScheme = `${BASE_SCHEME}${VARIANT_SCHEME_SUFFIX[variant]}`;
  const variantAppkitPath = `${APPKIT_PATH}${VARIANT_LINK_SUFFIX[variant]}`;
  // Per-variant app icon (badged internal/debug). iOS variants are per-variant
  // prebuilds driven by APP_VARIANT, so the icon is selected here. Android
  // internal/debug icons are applied per Gradle buildType by
  // plugins/withAndroidVariantIcons.js instead (CI prebuilds Android as
  // production), so production's icon here also covers the Android base.
  const iconDir = `./assets/icons/${variant}`;

  return {
    ...config,
    icon: `${iconDir}/icon.png`,
    // Register the variant-specific redirect scheme so deep-link-back works
    // (w3mwagmisample-internal:// for internal, w3mwagmisample-debug:// for debug).
    scheme: variantScheme,
    ios: {
      ...config.ios,
      // iOS variants = per-variant prebuild driven by APP_VARIANT.
      bundleIdentifier: `${BASE_APP_ID}${VARIANT_ID_SUFFIX[variant]}`,
    },
    android: {
      ...config.android,
      // Android keeps the base id here; the `.internal`/`.debug` suffix is applied
      // by the Gradle buildType (plugins/withAndroidVariants.js) so the existing
      // assembleInternal/assembleRelease CI flow works unchanged.
      package: BASE_APP_ID,
      // Rewrite the /rn_appkit universal-link path prefix to the variant path so
      // internal/debug App Links (…/rn_appkit_internal) resolve. No-op for
      // production (empty suffix).
      intentFilters: config.android.intentFilters?.map(filter => ({
        ...filter,
        data: filter.data?.map(entry =>
          entry.pathPrefix === APPKIT_PATH
            ? { ...entry, pathPrefix: variantAppkitPath }
            : entry,
        ),
      })),
    },
  };
};
