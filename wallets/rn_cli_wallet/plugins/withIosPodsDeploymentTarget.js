// Expo config plugin: raises every Pods target's IPHONEOS_DEPLOYMENT_TARGET to
// the app's own deployment target in the prebuild-generated ios/Podfile.
//
// Why: Xcode 27 only accepts deployment targets >= iOS 15.0. Some pods ship
// resource-bundle targets (privacy manifests) that hardcode an older target and
// don't inherit the app's, e.g. Sentry-Sentry (11.0), RNSVG-RNSVGFilters (12.4),
// lottie-ios-LottiePrivacyInfo (13.0), lottie-react-native-…_Privacy (13.4).
// With Xcode 27 those fail the build ("The iOS Simulator deployment target
// 'IPHONEOS_DEPLOYMENT_TARGET' is set to 11.0, but the range of supported
// deployment target versions is 15.0 to …"). Bumping them to the app's target
// (Podfile `platform :ios`) is a no-op on older Xcode, since the app can't run
// below its own target anyway.
//
// ios/ is generated (Continuous Native Generation), so the fix has to live in a
// plugin rather than a hand-edited Podfile.
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const MARKER = '# [withIosPodsDeploymentTarget]';

const SNIPPET = `
    ${MARKER} Xcode 27+ rejects deployment targets < iOS 15; lift pod targets
    # (incl. resource bundles) that hardcode an older one to the app's target.
    app_target = installer.aggregate_targets.first.platform.deployment_target.to_s
    installer.pods_project.targets.each do |pod_target|
      pod_target.build_configurations.each do |build_config|
        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current && Gem::Version.new(current) < Gem::Version.new(app_target)
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = app_target
        end
      end
    end`;

// Matches the full `react_native_post_install(...)` call inside post_install.
const RN_POST_INSTALL = /(\n([ \t]*)react_native_post_install\([\s\S]*?\n\2\))/;

function addPodsDeploymentTarget(podfile) {
  // Idempotent — prebuild regenerates the Podfile, but guard double application.
  if (podfile.includes(MARKER)) {
    return podfile;
  }
  if (!RN_POST_INSTALL.test(podfile)) {
    throw new Error(
      'withIosPodsDeploymentTarget: could not find react_native_post_install(...) in ios/Podfile',
    );
  }
  return podfile.replace(RN_POST_INSTALL, `$1\n${SNIPPET}`);
}

const withIosPodsDeploymentTarget = config =>
  withDangerousMod(config, [
    'ios',
    cfg => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      const podfile = fs.readFileSync(podfilePath, 'utf8');
      fs.writeFileSync(podfilePath, addPodsDeploymentTarget(podfile));
      return cfg;
    },
  ]);

module.exports = withIosPodsDeploymentTarget;
// Exported for unit testing the transform in isolation.
module.exports.addPodsDeploymentTarget = addPodsDeploymentTarget;
