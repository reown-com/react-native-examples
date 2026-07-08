// Expo config plugin: pins the Android NDK version in the prebuild-generated
// android/build.gradle so it can't drift from what CI pre-installs.
//
// Why: React Native's Android build fetches the NDK on the fly at build time,
// and that download intermittently lands corrupted on CI runners
// ("Archive is not a ZIP archive" -> InstallFailedException) — failing the
// build but passing on rerun. CI works around it by pre-installing the NDK via
// sdkmanager, which means CI must know the exact version. Expo owns the default
// (ExpoRootProjectPlugin: `setIfNotExist("ndkVersion") { ... "27.1.12297006" }`)
// and bumps it on SDK/RN upgrades, so hardcoding it separately in the CI action
// silently drifted and reintroduced the flaky fetch.
//
// This plugin makes app.json the single source of truth: the version passed here
//   ["./plugins/withAndroidNdkVersion.js", { "ndkVersion": "27.1.12297006" }]
// drives the native build (injected below) AND the CI pre-install (which reads
// the same app.json entry). Because android/build.gradle sets rootProject.ext
// .ndkVersion BEFORE `apply plugin: "expo-root-project"`, Expo's setIfNotExist
// default is a no-op and our value wins — while app/build.gradle keeps reading
// `ndkVersion rootProject.ext.ndkVersion` unchanged.
const { withProjectBuildGradle } = require('@expo/config-plugins');

const EXPO_ROOT_APPLY = 'apply plugin: "expo-root-project"';

function setNdkVersion(buildGradle, ndkVersion) {
  const line = `ext.ndkVersion = "${ndkVersion}"`;
  // Idempotent — prebuild regenerates build.gradle, but guard double application.
  if (buildGradle.includes(line)) {
    return buildGradle;
  }
  if (!buildGradle.includes(EXPO_ROOT_APPLY)) {
    throw new Error(
      `withAndroidNdkVersion: could not find '${EXPO_ROOT_APPLY}' in android/build.gradle`,
    );
  }
  // Insert before expo-root-project applies so its setIfNotExist("ndkVersion")
  // keeps our value instead of overwriting it with the Expo default.
  return buildGradle.replace(EXPO_ROOT_APPLY, `${line}\n${EXPO_ROOT_APPLY}`);
}

const withAndroidNdkVersion = (config, { ndkVersion } = {}) => {
  if (!ndkVersion) {
    throw new Error(
      'withAndroidNdkVersion: an { ndkVersion } option is required, e.g. ' +
        '["./plugins/withAndroidNdkVersion.js", { "ndkVersion": "27.1.12297006" }]',
    );
  }
  return withProjectBuildGradle(config, cfg => {
    if (cfg.modResults.language === 'groovy') {
      cfg.modResults.contents = setNdkVersion(cfg.modResults.contents, ndkVersion);
    }
    return cfg;
  });
};

module.exports = withAndroidNdkVersion;
// Exported for unit testing the transform in isolation.
module.exports.setNdkVersion = setNdkVersion;
