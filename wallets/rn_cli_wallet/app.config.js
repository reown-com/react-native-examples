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
// NOTE: while the committed ios/ and android/ projects are still authoritative
// (pre-prebuild), today's builds keep using the Xcode schemes / Gradle
// buildTypes; this file only takes effect once we switch to `expo prebuild`.

const BASE_APP_ID = 'com.walletconnect.web3wallet.rnsample';

const VARIANT_ID_SUFFIX = {
  production: '',
  internal: '.internal',
  debug: '.debug',
};

module.exports = ({ config }) => {
  const variant =
    process.env.APP_VARIANT in VARIANT_ID_SUFFIX
      ? process.env.APP_VARIANT
      : 'production';
  const appId = `${BASE_APP_ID}${VARIANT_ID_SUFFIX[variant]}`;
  const iconDir = `./assets/icons/${variant}`;

  return {
    ...config,
    icon: `${iconDir}/icon.png`,
    ios: {
      ...config.ios,
      bundleIdentifier: appId,
    },
    android: {
      ...config.android,
      package: appId,
      adaptiveIcon: {
        foregroundImage: `${iconDir}/adaptive-foreground.png`,
        backgroundImage: `${iconDir}/adaptive-background.png`,
        monochromeImage: `${iconDir}/adaptive-monochrome.png`,
      },
    },
  };
};
