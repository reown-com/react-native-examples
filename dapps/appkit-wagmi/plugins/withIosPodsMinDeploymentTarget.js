// Expo config plugin: raises every Pods target below iOS 15.1 to 15.1 in the
// prebuild-generated ios/Podfile post_install.
//
// Xcode 27 rejects deployment targets below iOS 15.0. Several pods still
// declare older minimums in their podspecs (lottie-ios 13.0,
// lottie-react-native 13.4), and their resource-bundle targets (privacy
// manifests, Metal libraries) keep that value, so the archive fails with
// "IPHONEOS_DEPLOYMENT_TARGET is set to 13.0, but the range of supported
// deployment target versions is 15.0 to 27.x". Raising them in post_install
// fixes every such pod at once instead of bumping each dependency.
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MIN_TARGET = '15.1';
const MARKER = '# @generated withIosPodsMinDeploymentTarget';

const SNIPPET = `
    ${MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current && Gem::Version.new(current) < Gem::Version.new('${MIN_TARGET}')
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${MIN_TARGET}'
        end
      end
    end`;

module.exports = function withIosPodsMinDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');
      if (podfile.includes(MARKER)) {
        return cfg;
      }
      const anchor = /post_install do \|installer\|\n/;
      if (!anchor.test(podfile)) {
        throw new Error('withIosPodsMinDeploymentTarget: no post_install block in Podfile');
      }
      podfile = podfile.replace(anchor, (m) => `${m}${SNIPPET}\n`);
      fs.writeFileSync(podfilePath, podfile);
      return cfg;
    },
  ]);
};
