// Expo config plugin: reproduces the wallet's Android build variants in the
// prebuild-generated android/app/build.gradle, so the existing CI (and the
// shared release-android-base workflow) keeps working unchanged:
//
//   ./gradlew assembleRelease   -> production  (com.walletconnect.web3wallet.rnsample)
//   ./gradlew assembleInternal  -> internal    (...rnsample.internal)
//
// It loads credentials from android/secrets.properties and adds:
//   - signingConfigs.internal (WC_*_INTERNAL) and signingConfigs.release (WC_*_UPLOAD)
//   - an `internal` buildType (.internal applicationId + -internal versionName,
//     internal signing, matchingFallbacks release)
//   - points the `release` buildType at signingConfigs.release
//
// (debug stays on Expo's default debug keystore. iOS variants are handled by
// APP_VARIANT in app.config.js instead — Android uses buildTypes to match CI.)
const { withAppBuildGradle } = require('@expo/config-plugins');

function addAndroidVariants(buildGradle) {
  // Idempotent — prebuild regenerates build.gradle, but guard double application.
  if (buildGradle.includes('def secretsProperties = new Properties()')) {
    return buildGradle;
  }

  // 1. Load secrets.properties before the signingConfigs block.
  const loadSecrets = `
    def secretsProperties = new Properties()
    def secretsPropertiesFile = rootProject.file("secrets.properties")
    if (secretsPropertiesFile.exists()) {
        secretsProperties.load(new FileInputStream(secretsPropertiesFile))
    }

    `;
  buildGradle = buildGradle.replace(
    /(\n\s*signingConfigs\s*\{)/,
    `${loadSecrets}$1`,
  );

  // 2. Add internal + release signing configs after the default `debug` one.
  const signingConfigs = `        internal {
            if (secretsPropertiesFile.exists()) {
                storeFile file(secretsProperties['WC_FILENAME_INTERNAL'])
                storePassword secretsProperties['WC_STORE_PASSWORD_INTERNAL']
                keyAlias secretsProperties['WC_KEYSTORE_ALIAS']
                keyPassword secretsProperties['WC_KEY_PASSWORD_INTERNAL']
            }
        }
        release {
            if (secretsPropertiesFile.exists()) {
                storeFile file(secretsProperties['WC_FILENAME_UPLOAD'])
                storePassword secretsProperties['WC_STORE_PASSWORD_UPLOAD']
                keyAlias secretsProperties['WC_KEYSTORE_ALIAS']
                keyPassword secretsProperties['WC_KEY_PASSWORD_UPLOAD']
            }
        }`;
  buildGradle = buildGradle.replace(
    /(signingConfigs\s*\{[^}]*debug\s*\{[^}]*\})\s*(\n\s*\})/s,
    `$1\n${signingConfigs}\n    $2`,
  );

  // 3. Add the `internal` buildType at the top of the buildTypes block.
  const internalBuildType = `        internal {
            applicationIdSuffix ".internal"
            versionNameSuffix "-internal"
            signingConfig signingConfigs.internal
            matchingFallbacks = ['release']
        }`;
  buildGradle = buildGradle.replace(
    /(\n\s*buildTypes\s*\{)/,
    `$1\n${internalBuildType}`,
  );

  // 4. Point the release buildType at signingConfigs.release (Expo defaults to .debug).
  buildGradle = buildGradle.replace(
    /(release\s*\{[^}]*?)signingConfig\s+signingConfigs\.debug/s,
    '$1signingConfig signingConfigs.release',
  );

  // 5. Give the debug buildType a .debug applicationId so it can coexist with
  // release + internal (Expo's default debug has no suffix → collides with
  // release). `signingConfig signingConfigs.debug` is unique to this block.
  buildGradle = buildGradle.replace(
    /(\n(\s*)signingConfig\s+signingConfigs\.debug\b)/,
    '\n$2applicationIdSuffix ".debug"\n$2versionNameSuffix "-debug"$1',
  );

  return buildGradle;
}

const withAndroidVariants = config =>
  withAppBuildGradle(config, cfg => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = addAndroidVariants(cfg.modResults.contents);
    }
    return cfg;
  });

module.exports = withAndroidVariants;
// Exported for unit testing the transform in isolation.
module.exports.addAndroidVariants = addAndroidVariants;
