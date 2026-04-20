package com.reown.mobilepos.hce

import android.content.Context
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HceModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

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
      NfcManager.setActivity(appContext.currentActivity)
      NfcManager.enable()
    }

    OnActivityEntersBackground {
      NfcManager.disable()
      NfcManager.setActivity(null)
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
