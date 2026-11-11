// Expo config plugin: appends app-level keep rules to the prebuild-generated
// android/app/proguard-rules.pro.
//
// Why: Expo SDK 58 enables R8 for release builds by default
// (android.enableMinifyInReleaseBuilds), and plugins/withAndroidVariants.js
// minifies the `internal` buildType the same way. Libraries should ship their
// own consumer rules; rules for libraries that don't belong here.
//
// react-native-device-info: its install-referrer client reaches
// com.android.installreferrer.api.InstallReferrerClient through reflection
// (newBuilder(Context)). Without this rule R8 renames the class and every
// release launch logs `NoSuchMethodException: <obfuscated>.newBuilder`. The rule
// is the one the library's README documents.
const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("@expo/config-plugins");

const MARKER = "# [withAndroidProguardRules]";

const RULES = `
${MARKER}
# react-native-device-info: install referrer is loaded by reflection.
-keep class com.android.installreferrer.api.** { *; }
`;

function addProguardRules(contents) {
  if (contents.includes(MARKER)) {
    return contents;
  }
  return `${contents.trimEnd()}\n${RULES}`;
}

const withAndroidProguardRules = (config) =>
  withDangerousMod(config, [
    "android",
    (cfg) => {
      const rulesPath = path.join(
        cfg.modRequest.platformProjectRoot,
        "app",
        "proguard-rules.pro",
      );
      const contents = fs.readFileSync(rulesPath, "utf8");
      fs.writeFileSync(rulesPath, addProguardRules(contents));
      return cfg;
    },
  ]);

module.exports = withAndroidProguardRules;
// Exported for unit testing the transform in isolation.
module.exports.addProguardRules = addProguardRules;
