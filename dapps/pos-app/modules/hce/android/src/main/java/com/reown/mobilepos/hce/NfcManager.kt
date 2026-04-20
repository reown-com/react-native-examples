package com.reown.mobilepos.hce

import android.app.Activity
import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.nfc.cardemulation.CardEmulation
import java.lang.ref.WeakReference

/**
 * Manages NFC payment link delivery for the POS payment flow.
 *
 * Ported from reown-kotlin sample/pos/nfc/NfcManager.kt.
 */
internal object NfcManager {

  @Volatile
  private var currentUri: String? = null

  @Volatile
  private var isEnabled: Boolean = false

  private var appContext: Context? = null
  private var foregroundActivityRef: WeakReference<Activity>? = null

  var onTap: (() -> Unit)? = null

  /** Whether HCE NFC tag emulation is available on this device. */
  val isHceSupported: Boolean
    get() {
      val ctx = appContext ?: return false
      val adapter = NfcAdapter.getDefaultAdapter(ctx) ?: return false
      return ctx.packageManager.hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION)
    }

  val isNfcSupported: Boolean
    get() {
      val ctx = appContext ?: return false
      return NfcAdapter.getDefaultAdapter(ctx) != null
    }

  val isNfcEnabled: Boolean
    get() {
      val ctx = appContext ?: return false
      val adapter = NfcAdapter.getDefaultAdapter(ctx) ?: return false
      return adapter.isEnabled
    }

  fun init(context: Context) {
    appContext = context.applicationContext
  }

  fun setActivity(activity: Activity?) {
    val previousActivity = foregroundActivityRef?.get()
    foregroundActivityRef = activity?.let { WeakReference(it) }
    val ctx = appContext ?: return
    val adapter = NfcAdapter.getDefaultAdapter(ctx) ?: return
    val cardEmulation = CardEmulation.getInstance(adapter)
    val component = ComponentName(ctx, NdefHostApduService::class.java)
    if (activity != null) {
      cardEmulation.setPreferredService(activity, component)
    } else {
      previousActivity?.let { cardEmulation.unsetPreferredService(it) }
    }
  }

  fun updatePaymentUri(uri: String) {
    currentUri = uri
    if (isEnabled) {
      emitNdef(uri)
    }
  }

  fun clearPaymentUri() {
    currentUri = null
    NdefHostApduService.currentNdefBytes = null
    NdefHostApduService.onBeingReadCallback = null
  }

  fun enable() {
    isEnabled = true
    val uri = currentUri ?: return
    emitNdef(uri)
  }

  fun disable() {
    isEnabled = false
    NdefHostApduService.currentNdefBytes = null
    NdefHostApduService.onBeingReadCallback = null
  }

  private fun emitNdef(paymentUri: String) {
    val ndefMessage = NdefMessage(
      arrayOf(NdefRecord.createUri(paymentUri))
    )
    val ndefBytes = ndefMessage.toByteArray()
    NdefHostApduService.currentNdefBytes = ndefBytes
    NdefHostApduService.onBeingReadCallback = {
      onTap?.invoke()
    }
  }
}
