const { withAndroidManifest } = require("@expo/config-plugins");

// Single build-time gate for the entire NFC/HCE manifest surface. Gated on the same
// EXPO_PUBLIC_NFC_HCE_ENABLED flag as plugins/withHceFeatureFlag.js and
// utils/feature-flags.ts. When the flag is not "true" this plugin is a no-op, so the
// built manifest carries NO NFC permission, NO nfc.hce uses-feature, and NO exported
// HCE service — a Play reviewer sees nothing that reads as tap-to-pay.
//
// When enabled it injects all three (previously split between app.json permissions,
// this plugin, and the local module's library AndroidManifest.xml):
//   1. the android.permission.NFC permission
//   2. the android.hardware.nfc.hce uses-feature (required=false)
//   3. the exported NdefHostApduService with its HOST_APDU_SERVICE intent-filter
//
// The native kill-switch meta-data (HCE_ENABLED) is injected separately and in BOTH
// states by withHceFeatureFlag.js, so the native module stays explicitly gated.

const PERMISSION_NFC = "android.permission.NFC";
const FEATURE_NFC_HCE = "android.hardware.nfc.hce";
// Absolute FQN (the module's own namespace, not the app's applicationId) so it stays
// correct under the .internal variant. Kept in sync with NdefHostApduService.kt.
const SERVICE_NAME = "com.walletconnect.mobilepos.hce.NdefHostApduService";

function ensureUsesPermission(manifest, name) {
  if (!manifest["uses-permission"]) {
    manifest["uses-permission"] = [];
  }
  const permissions = manifest["uses-permission"];
  const exists = permissions.some((p) => p.$?.["android:name"] === name);
  if (!exists) {
    permissions.push({ $: { "android:name": name } });
  }
}

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

function ensureHceService(application) {
  if (!application.service) {
    application.service = [];
  }
  const exists = application.service.some(
    (s) => s.$?.["android:name"] === SERVICE_NAME
  );
  if (exists) {
    return;
  }
  application.service.push({
    $: {
      "android:name": SERVICE_NAME,
      "android:exported": "true",
      "android:permission": "android.permission.BIND_NFC_SERVICE",
    },
    "intent-filter": [
      {
        action: [
          {
            $: {
              "android:name":
                "android.nfc.cardemulation.action.HOST_APDU_SERVICE",
            },
          },
        ],
        category: [
          { $: { "android:name": "android.intent.category.DEFAULT" } },
        ],
      },
    ],
    "meta-data": [
      {
        $: {
          "android:name": "android.nfc.cardemulation.host_apdu_service",
          "android:resource": "@xml/nfc_apdu_service",
        },
      },
    ],
  });
}

const withHceNfc = (config) => {
  if (process.env.EXPO_PUBLIC_NFC_HCE_ENABLED !== "true") {
    return config;
  }
  return withAndroidManifest(config, (c) => {
    const manifest = c.modResults.manifest;
    ensureUsesPermission(manifest, PERMISSION_NFC);
    ensureUsesFeature(manifest, FEATURE_NFC_HCE);
    const application = manifest.application?.[0];
    if (application) {
      ensureHceService(application);
    }
    return c;
  });
};

module.exports = withHceNfc;
