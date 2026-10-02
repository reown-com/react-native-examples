package com.walletconnect.mobilepos.hce

import android.content.Context
import android.content.pm.PackageManager
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HceModule : Module() {
  companion object {
    private const val META_DATA_HCE_ENABLED = "com.walletconnect.mobilepos.hce.HCE_ENABLED"
  }

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  // Build-time kill-switch injected by plugins/withHceFeatureFlag.js (kept in sync
  // with the JS flag EXPO_PUBLIC_NFC_HCE_ENABLED). When false, HCE never starts.
  private val hceEnabled: Boolean by lazy {
    try {
      val appInfo = context.packageManager.getApplicationInfo(
        context.packageName,
        PackageManager.GET_META_DATA
      )
      appInfo.metaData?.getBoolean(META_DATA_HCE_ENABLED, false) ?: false
    } catch (e: Exception) {
      false
    }
  }

  override fun definition() = ModuleDefinition {
    Name("HceModule")

    Events("onTap")

    OnCreate {
      NfcManager.init(context)
      NfcManager.onTap = {
        this@HceModule.sendEvent("onTap", emptyMap<String, Any?>())
      }
    }

    OnActivityEntersForeground {
      // Skip entirely when disabled: setActivity() registers the app as the
      // preferred foreground HCE service (CardEmulation.setPreferredService),
      // which must not happen when the feature is off.
      if (hceEnabled) {
        NfcManager.setActivity(appContext.currentActivity)
        NfcManager.enable()
      }
    }

    OnActivityEntersBackground {
      if (hceEnabled) {
        NfcManager.disable()
        NfcManager.setActivity(null)
      }
    }

    AsyncFunction("getNfcCapabilities") {
      return@AsyncFunction mapOf(
        "isNfcSupported" to NfcManager.isNfcSupported,
        "isNfcEnabled" to NfcManager.isNfcEnabled,
        "isHceSupported" to NfcManager.isHceSupported
      )
    }

    AsyncFunction("setPaymentUrl") { url: String ->
      NfcManager.updatePaymentUri(url)
    }

    AsyncFunction("clearPaymentUrl") {
      NfcManager.clearPaymentUri()
    }
  }
}
