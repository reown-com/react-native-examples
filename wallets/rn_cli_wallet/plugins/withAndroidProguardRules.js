// Expo config plugin: appends app-level keep rules to the prebuild-generated
// android/app/proguard-rules.pro.
//
// Why: Expo SDK 58 enables R8 for release builds by default. Libraries should
// ship their own consumer rules (react-native-compat's JNA/uniffi rules are
// patched in .yarn/patches until they land upstream), but some don't keep
// enough for R8 full mode. Rules that belong to the app go here.
//
// ML Kit (barcode scanning for react-native-vision-camera's code scanner):
// its Firebase-style ComponentRegistrar classes are instantiated by reflection
// through their no-arg constructor. The library's own rule keeps the classes
// but, under R8 full mode, not their constructors, so ComponentDiscovery logs
// `NoSuchMethodException: ...Registrar.<init>` and ML Kit never registers.
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const MARKER = '# [withAndroidProguardRules]';

const RULES = `
${MARKER}
# ML Kit / Firebase component registrars are created via their no-arg constructor.
-keep class * implements com.google.firebase.components.ComponentRegistrar { <init>(); }
`;

function addProguardRules(contents) {
  if (contents.includes(MARKER)) {
    return contents;
  }
  return `${contents.trimEnd()}\n${RULES}`;
}

const withAndroidProguardRules = config =>
  withDangerousMod(config, [
    'android',
    cfg => {
      const rulesPath = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro',
      );
      const contents = fs.readFileSync(rulesPath, 'utf8');
      fs.writeFileSync(rulesPath, addProguardRules(contents));
      return cfg;
    },
  ]);

module.exports = withAndroidProguardRules;
// Exported for unit testing the transform in isolation.
module.exports.addProguardRules = addProguardRules;
