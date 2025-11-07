// scripts/withAndroidHCE.js
const {
  withAndroidManifest,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Adds NFC HCE (Host Card Emulation) configuration to AndroidManifest.xml
 * and creates the aid_list.xml resource file required by @icedevml/react-native-host-card-emulation
 */
const withAndroidHCE = (config) => {
  // Modify AndroidManifest.xml to add uses-feature and service
  config = withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;

    // Add uses-feature for NFC HCE
    if (!manifest["uses-feature"]) {
      manifest["uses-feature"] = [];
    }

    // Check if NFC HCE feature already exists
    const hasNfcHceFeature = manifest["uses-feature"].some(
      (feature) => feature.$?.["android:name"] === "android.hardware.nfc.hce",
    );

    if (!hasNfcHceFeature) {
      manifest["uses-feature"].push({
        $: {
          "android:name": "android.hardware.nfc.hce",
          "android:required": "true",
        },
      });
    }

    // Add HCE service to application
    const mainApplication = manifest.application?.[0];
    if (mainApplication) {
      if (!mainApplication.service) {
        mainApplication.service = [];
      }

      // Check if HCEService already exists
      const hasHCEService = mainApplication.service.some(
        (service) =>
          service.$?.["android:name"] ===
          "com.itsecrnd.rtnhceandroid.HCEService",
      );

      if (!hasHCEService) {
        mainApplication.service.push({
          $: {
            "android:name": "com.itsecrnd.rtnhceandroid.HCEService",
            "android:exported": "true",
            "android:enabled": "true",
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
                {
                  $: {
                    "android:name": "android.intent.category.DEFAULT",
                  },
                },
              ],
            },
          ],
          "meta-data": [
            {
              $: {
                "android:name": "android.nfc.cardemulation.host_apdu_service",
                "android:resource": "@xml/aid_list",
              },
            },
          ],
        });
      }
    }

    return config;
  });

  // Create aid_list.xml file in Android resources
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const resPath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
      );

      // Create xml directory if it doesn't exist
      if (!fs.existsSync(resPath)) {
        fs.mkdirSync(resPath, { recursive: true });
      }

      const aidFilePath = path.join(resPath, "aid_list.xml");

      // Check if file already exists to avoid overwriting customizations
      if (fs.existsSync(aidFilePath)) {
        console.log("aid_list.xml already exists, skipping creation...");
        return config;
      }

      // Create aid_list.xml with NFC Type 4 tag AID
      const aidFileContent = `<?xml version="1.0" encoding="utf-8"?>
<host-apdu-service xmlns:android="http://schemas.android.com/apk/res/android"
                   android:description="@string/app_name"
                   android:requireDeviceUnlock="false">
  <aid-group android:category="other"
             android:description="@string/app_name">
    <!-- NFC Type 4 tag emulation AIDs -->
    <aid-filter android:name="D2760000850100" />
    <aid-filter android:name="D2760000850101" />
  </aid-group>
</host-apdu-service>`;

      fs.writeFileSync(aidFilePath, aidFileContent, "utf8");
      console.log("Created aid_list.xml for @icedevml/react-native-host-card-emulation");

      return config;
    },
  ]);

  return config;
};

module.exports = withAndroidHCE;
