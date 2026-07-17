// scripts/withAndroidReleaseSigningConfig.js
const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * Adds release signing config to android/app/build.gradle
 * Similar to W3MWagmi setup, loads from secrets.properties
 */
const withAndroidReleaseSigningConfig = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = addReleaseSigningConfig(
        config.modResults.contents,
      );
    }
    return config;
  });
};

function addReleaseSigningConfig(buildGradle) {
  // Check if already modified - be more explicit
  if (buildGradle.includes("def secretsProperties = new Properties()")) {
    console.log("secretsProperties already exists, skipping...");
    return buildGradle;
  }

  if (buildGradle.includes("signingConfigs.release")) {
    console.log("Release signing config already exists, skipping...");
    return buildGradle;
  }

  // Add secrets.properties loading before signingConfigs block
  const secretsPropertiesCode = `
    def secretsProperties = new Properties()
    def secretsPropertiesFile = rootProject.file("secrets.properties")
    if (secretsPropertiesFile.exists()) {
        secretsProperties.load(new FileInputStream(secretsPropertiesFile))
    }

    `;

  // Insert before signingConfigs block
  const signingConfigsStart = /(\n\s*signingConfigs\s*\{)/;
  if (signingConfigsStart.test(buildGradle)) {
    buildGradle = buildGradle.replace(
      signingConfigsStart,
      `${secretsPropertiesCode}$1`,
    );
  }

  // Add release signing config
  const releaseSigningConfig = `        release {
            if (secretsPropertiesFile.exists()) {
                storeFile file(secretsProperties['WC_FILENAME_UPLOAD'])
                storePassword secretsProperties['WC_STORE_PASSWORD_UPLOAD']
                keyAlias secretsProperties['WC_KEYSTORE_ALIAS']
                keyPassword secretsProperties['WC_KEY_PASSWORD_UPLOAD']
            }
        }`;

  // Find and replace signingConfigs block - add release config after debug
  const signingConfigsRegex =
    /(signingConfigs\s*\{[^}]*debug\s*\{[^}]*\})\s*(\})/s;

  if (signingConfigsRegex.test(buildGradle)) {
    buildGradle = buildGradle.replace(
      signingConfigsRegex,
      `$1\n${releaseSigningConfig}\n    $2`,
    );
  }

  // Change signingConfig in release buildType from debug to release
  buildGradle = buildGradle.replace(
    /(release\s*\{[^}]*?)signingConfig\s+signingConfigs\.debug/s,
    "$1signingConfig signingConfigs.release",
  );

  return buildGradle;
}

module.exports = withAndroidReleaseSigningConfig;
