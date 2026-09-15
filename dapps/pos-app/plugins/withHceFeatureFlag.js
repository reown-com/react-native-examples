const { withAndroidManifest } = require("@expo/config-plugins");

// Kept in sync with the JS flag in utils/feature-flags.ts. This injects the same
// value into the merged AndroidManifest as an <application> meta-data entry so the
// native HCE module (com.walletconnect.mobilepos.hce) can gate NfcManager.enable() without
// coupling to the app's variant-specific applicationId / BuildConfig.
const META_DATA_NAME = "com.walletconnect.mobilepos.hce.HCE_ENABLED";

function setMetaData(application, name, value) {
  if (!application["meta-data"]) {
    application["meta-data"] = [];
  }
  const metaData = application["meta-data"];
  const existing = metaData.find((m) => m.$?.["android:name"] === name);
  if (existing) {
    existing.$["android:value"] = value;
  } else {
    metaData.push({ $: { "android:name": name, "android:value": value } });
  }
}

const withHceFeatureFlag = (config) =>
  withAndroidManifest(config, (c) => {
    const enabled = process.env.EXPO_PUBLIC_NFC_HCE_ENABLED === "true";
    const application = c.modResults.manifest.application?.[0];
    if (application) {
      setMetaData(application, META_DATA_NAME, String(enabled));
    }
    return c;
  });

module.exports = withHceFeatureFlag;
