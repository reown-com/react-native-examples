// Expo config plugin: per-buildType Android launcher icons. Android variants
// are Gradle buildTypes from a single prebuild, so app.config.js's adaptiveIcon
// can't give internal/debug their own badge. Copy committed badged mipmaps into
// the buildType source sets; resource merging prefers src/<buildType>/res over
// src/main/res, so assembleInternal/Debug get the badge and assembleRelease
// keeps the production icon (assumes prebuild ran APP_VARIANT=production).
//
//   native-icons/android/internal/res -> android/app/src/internal/res
//   native-icons/android/debug/res    -> android/app/src/debug/res
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const VARIANTS = ['internal', 'debug'];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

const withAndroidVariantIcons = config =>
  withDangerousMod(config, [
    'android',
    cfg => {
      const { projectRoot, platformProjectRoot } = cfg.modRequest;
      for (const variant of VARIANTS) {
        const srcRes = path.join(
          projectRoot,
          'native-icons',
          'android',
          variant,
          'res',
        );
        if (!fs.existsSync(srcRes)) {
          console.warn(
            `[withAndroidVariantIcons] missing ${srcRes}; skipping ${variant} icon overlay`,
          );
          continue;
        }
        copyDir(srcRes, path.join(platformProjectRoot, 'app', 'src', variant, 'res'));
      }
      return cfg;
    },
  ]);

module.exports = withAndroidVariantIcons;
