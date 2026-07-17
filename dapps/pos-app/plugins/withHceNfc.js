const { withAndroidManifest } = require("@expo/config-plugins");

const FEATURE_NFC_HCE = "android.hardware.nfc.hce";

function ensureUsesFeature(manifest, name) {
  if (!manifest["uses-feature"]) {
    manifest["uses-feature"] = [];
  }
  const features = manifest["uses-feature"];
  const exists = features.some((f) => f.$?.["android:name"] === name);
  if (!exists) {
    features.push({
      $: {
        "android:name": name,
        "android:required": "false",
      },
    });
  }
}

const withHceNfc = (config) =>
  withAndroidManifest(config, (c) => {
    const manifest = c.modResults.manifest;
    ensureUsesFeature(manifest, FEATURE_NFC_HCE);
    return c;
  });

module.exports = withHceNfc;
