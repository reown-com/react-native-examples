// Expo config plugin: adds a `release` signing config to the generated
// android/app/build.gradle, loading credentials from android/secrets.properties.
//
// The signing key is chosen by APP_VARIANT (see app.config.js) so a per-variant
// prebuild signs with the matching key:
//   production -> WC_*_UPLOAD     (Play upload key)
//   internal   -> WC_*_INTERNAL   (internal distribution key)
//   debug      -> WC_*_DEBUG
//
// secrets.properties is provided by scripts/setup-secrets.js (postprebuild) for
// local/mock builds, and by CI for real release builds. The injected config is
// guarded by `secretsPropertiesFile.exists()` so prebuild/JS-only flows that
// lack the file still configure cleanly (the release build just stays unsigned
// until the file is present).
const { withAppBuildGradle } = require('@expo/config-plugins');

const SIGNING_BY_VARIANT = {
  production: {
    file: 'WC_FILENAME_UPLOAD',
    storePassword: 'WC_STORE_PASSWORD_UPLOAD',
    alias: 'WC_KEYSTORE_ALIAS',
    keyPassword: 'WC_KEY_PASSWORD_UPLOAD',
  },
  internal: {
    file: 'WC_FILENAME_INTERNAL',
    storePassword: 'WC_STORE_PASSWORD_INTERNAL',
    alias: 'WC_KEYSTORE_ALIAS',
    keyPassword: 'WC_KEY_PASSWORD_INTERNAL',
  },
  debug: {
    file: 'WC_FILENAME_DEBUG',
    storePassword: 'WC_STORE_PASSWORD_DEBUG',
    alias: 'WC_KEYSTORE_ALIAS_DEBUG',
    keyPassword: 'WC_KEY_PASSWORD_DEBUG',
  },
};

function resolveVariant() {
  const v = process.env.APP_VARIANT;
  return v && Object.prototype.hasOwnProperty.call(SIGNING_BY_VARIANT, v)
    ? v
    : 'production';
}

function addReleaseSigningConfig(buildGradle, variant) {
  // Idempotent — prebuild regenerates build.gradle, but guard double-application.
  if (buildGradle.includes('def secretsProperties = new Properties()')) {
    return buildGradle;
  }
  const keys = SIGNING_BY_VARIANT[variant] || SIGNING_BY_VARIANT.production;

  // Load secrets.properties just before the signingConfigs block.
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

  // Add a `release` signing config after the default `debug` one.
  const releaseSigningConfig = `        release {
            if (secretsPropertiesFile.exists()) {
                storeFile file(secretsProperties['${keys.file}'])
                storePassword secretsProperties['${keys.storePassword}']
                keyAlias secretsProperties['${keys.alias}']
                keyPassword secretsProperties['${keys.keyPassword}']
            }
        }`;
  buildGradle = buildGradle.replace(
    /(signingConfigs\s*\{[^}]*debug\s*\{[^}]*\})\s*(\})/s,
    `$1\n${releaseSigningConfig}\n    $2`,
  );

  // Point the release build type at signingConfigs.release (expo defaults to .debug).
  buildGradle = buildGradle.replace(
    /(release\s*\{[^}]*?)signingConfig\s+signingConfigs\.debug/s,
    '$1signingConfig signingConfigs.release',
  );

  return buildGradle;
}

const withAndroidReleaseSigning = config =>
  withAppBuildGradle(config, cfg => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = addReleaseSigningConfig(
        cfg.modResults.contents,
        resolveVariant(),
      );
    }
    return cfg;
  });

module.exports = withAndroidReleaseSigning;
// Exported for unit testing the transform in isolation.
module.exports.addReleaseSigningConfig = addReleaseSigningConfig;
module.exports.SIGNING_BY_VARIANT = SIGNING_BY_VARIANT;
