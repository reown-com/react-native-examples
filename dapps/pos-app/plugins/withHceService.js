const {
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const HCE_SERVICE_NAME = ".hce.HceService";
const HCE_MODULE_PACKAGE = "com.reown.mobilepos.hce";

function withHceService(config) {
  config = withHceManifest(config);
  config = withHceNativeFiles(config);
  return config;
}

function withHceManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    const hceServiceExists = application.service?.some(
      (service) => service.$["android:name"] === HCE_SERVICE_NAME
    );

    if (!hceServiceExists) {
      if (!application.service) {
        application.service = [];
      }

      application.service.push({
        $: {
          "android:name": HCE_SERVICE_NAME,
          "android:exported": "true",
          "android:permission": "android.permission.BIND_NFC_SERVICE",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name": "android.nfc.cardemulation.action.HOST_APDU_SERVICE",
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
              "android:resource": "@xml/apduservice",
            },
          },
        ],
      });
    }

    return config;
  });
}

function withHceNativeFiles(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidPath = path.join(projectRoot, "android");

      const hceDir = path.join(
        androidPath,
        "app/src/main/java/com/reown/mobilepos/hce"
      );
      const xmlDir = path.join(androidPath, "app/src/main/res/xml");

      if (!fs.existsSync(hceDir)) {
        fs.mkdirSync(hceDir, { recursive: true });
      }
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(hceDir, "HceService.kt"),
        getHceServiceCode()
      );

      fs.writeFileSync(
        path.join(hceDir, "HceModule.kt"),
        getHceModuleCode()
      );

      fs.writeFileSync(
        path.join(hceDir, "HcePackage.kt"),
        getHcePackageCode()
      );

      fs.writeFileSync(
        path.join(xmlDir, "apduservice.xml"),
        getApduServiceXml()
      );

      const mainApplicationPath = path.join(
        androidPath,
        "app/src/main/java/com/reown/mobilepos/MainApplication.kt"
      );

      if (fs.existsSync(mainApplicationPath)) {
        let mainAppContent = fs.readFileSync(mainApplicationPath, "utf8");

        if (!mainAppContent.includes("HcePackage")) {
          mainAppContent = mainAppContent.replace(
            "import com.facebook.react.PackageList",
            "import com.facebook.react.PackageList\nimport com.reown.mobilepos.hce.HcePackage"
          );

          mainAppContent = mainAppContent.replace(
            /override val packages: List<ReactPackage>\s*get\(\)\s*=\s*PackageList\(this\)\.packages/,
            `override val packages: List<ReactPackage>
        get() = PackageList(this).packages.apply {
          add(HcePackage())
        }`
          );

          fs.writeFileSync(mainApplicationPath, mainAppContent);
        }
      }

      return config;
    },
  ]);
}

function getHceServiceCode() {
  return `package com.reown.mobilepos.hce

import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import android.util.Log

class HceService : HostApduService() {

    companion object {
        private const val TAG = "HceService"
        
        private val SELECT_APDU = byteArrayOf(
            0x00.toByte(), // CLA
            0xA4.toByte(), // INS (SELECT)
            0x04.toByte(), // P1 (Select by name)
            0x00.toByte(), // P2
            0x07.toByte(), // Length of AID
            0xF0.toByte(), 0x01.toByte(), 0x02.toByte(), 0x03.toByte(), 
            0x04.toByte(), 0x05.toByte(), 0x06.toByte() // AID: F0010203040506
        )
        
        private val SUCCESS_SW = byteArrayOf(0x90.toByte(), 0x00.toByte())
        private val FAILURE_SW = byteArrayOf(0x6F.toByte(), 0x00.toByte())
        
        @Volatile
        var ndefMessage: ByteArray? = null
    }

    override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
        if (commandApdu == null) {
            Log.w(TAG, "Received null APDU")
            return FAILURE_SW
        }

        Log.d(TAG, "Received APDU: \${commandApdu.toHexString()}")

        if (isSelectApdu(commandApdu)) {
            Log.d(TAG, "SELECT APDU received, sending NDEF message")
            val message = ndefMessage
            return if (message != null) {
                Log.d(TAG, "Sending NDEF message of \${message.size} bytes")
                message + SUCCESS_SW
            } else {
                Log.w(TAG, "No NDEF message set")
                FAILURE_SW
            }
        }

        return SUCCESS_SW
    }

    override fun onDeactivated(reason: Int) {
        Log.d(TAG, "Deactivated: \$reason")
    }

    private fun isSelectApdu(apdu: ByteArray): Boolean {
        return apdu.size >= 2 && apdu[0] == 0x00.toByte() && apdu[1] == 0xA4.toByte()
    }

    private fun ByteArray.toHexString(): String = joinToString("") { "%02X".format(it) }
}
`;
}

function getHceModuleCode() {
  return `package com.reown.mobilepos.hce

import android.nfc.NdefMessage
import android.nfc.NdefRecord
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class HceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "HceModule"

    @ReactMethod
    fun setNdefMessage(uri: String, promise: Promise) {
        try {
            val ndefRecord = NdefRecord.createUri(uri)
            val ndefMessage = NdefMessage(arrayOf(ndefRecord))
            val messageBytes = ndefMessage.toByteArray()
            
            HceService.ndefMessage = messageBytes
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("HCE_ERROR", "Failed to set NDEF message: \${e.message}", e)
        }
    }

    @ReactMethod
    fun clearNdefMessage(promise: Promise) {
        try {
            HceService.ndefMessage = null
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("HCE_ERROR", "Failed to clear NDEF message: \${e.message}", e)
        }
    }

    @ReactMethod
    fun isNfcEnabled(promise: Promise) {
        try {
            val nfcAdapter = android.nfc.NfcAdapter.getDefaultAdapter(reactApplicationContext)
            promise.resolve(nfcAdapter?.isEnabled == true)
        } catch (e: Exception) {
            promise.reject("HCE_ERROR", "Failed to check NFC status: \${e.message}", e)
        }
    }
}
`;
}

function getHcePackageCode() {
  return `package com.reown.mobilepos.hce

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class HcePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(HceModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
`;
}

function getApduServiceXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<host-apdu-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/app_name"
    android:requireDeviceUnlock="false">
    <aid-group
        android:category="other"
        android:description="@string/app_name">
        <!-- Custom AID for WPay NFC payment -->
        <aid-filter android:name="F0010203040506" />
    </aid-group>
</host-apdu-service>
`;
}

module.exports = withHceService;
