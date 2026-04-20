package com.reown.mobilepos.hce

import android.nfc.cardemulation.HostApduService
import android.os.Bundle

/**
 * HCE service emulating an NFC Forum Type 4 Tag.
 *
 * When a reader (wallet phone) taps this device, the Android NFC stack
 * routes APDU commands here. We respond with a Capability Container
 * and the current NDEF message (containing the payment URI).
 *
 * Ported from reown-kotlin sample/pos/nfc/NdefHostApduService.kt.
 */
class NdefHostApduService : HostApduService() {

  private enum class SelectedFile { NONE, CC, NDEF }

  private var selectedFile = SelectedFile.NONE
  private var hasNotifiedRead = false
  private var sessionNdefFile: ByteArray? = null

  override fun processCommandApdu(commandApdu: ByteArray, extras: Bundle?): ByteArray {
    if (commandApdu.size < 4) return SW_UNKNOWN

    val ins = commandApdu[1]
    return when {
      ins == INS_SELECT -> handleSelect(commandApdu)
      ins == INS_READ_BINARY -> handleReadBinary(commandApdu)
      else -> SW_INS_NOT_SUPPORTED
    }
  }

  override fun onDeactivated(reason: Int) {
    selectedFile = SelectedFile.NONE
    hasNotifiedRead = false
  }

  private fun handleSelect(apdu: ByteArray): ByteArray {
    if (apdu.size < 5) return SW_UNKNOWN

    val p1 = apdu[2]
    val lc = apdu[4].toInt() and 0xFF

    if (p1 == P1_SELECT_BY_AID) {
      if (apdu.size < 5 + lc) return SW_UNKNOWN
      val aid = apdu.copyOfRange(5, 5 + lc)
      if (aid.contentEquals(NDEF_AID)) {
        selectedFile = SelectedFile.NONE
        hasNotifiedRead = false
        return SW_OK
      }
      return SW_FILE_NOT_FOUND
    }

    if (p1 == P1_SELECT_BY_ID) {
      if (lc != 2 || apdu.size < 7) return SW_WRONG_PARAMS
      val fileId = ((apdu[5].toInt() and 0xFF) shl 8) or (apdu[6].toInt() and 0xFF)
      return when (fileId) {
        FILE_ID_CC -> {
          selectedFile = SelectedFile.CC
          SW_OK
        }
        FILE_ID_NDEF -> {
          selectedFile = SelectedFile.NDEF
          hasNotifiedRead = false
          val ndefBytes = currentNdefBytes
          sessionNdefFile = if (ndefBytes != null) {
            val len = ndefBytes.size
            byteArrayOf((len shr 8).toByte(), (len and 0xFF).toByte()) + ndefBytes
          } else {
            byteArrayOf(0x00, 0x00)
          }
          SW_OK
        }
        else -> SW_FILE_NOT_FOUND
      }
    }

    return SW_WRONG_PARAMS
  }

  private fun handleReadBinary(apdu: ByteArray): ByteArray {
    if (apdu.size < 4) return SW_UNKNOWN
    val offset = ((apdu[2].toInt() and 0xFF) shl 8) or (apdu[3].toInt() and 0xFF)
    val le = if (apdu.size > 4) {
      val raw = apdu[4].toInt() and 0xFF
      if (raw == 0) 256 else raw
    } else {
      256
    }

    return when (selectedFile) {
      SelectedFile.CC -> readFromFile(CAPABILITY_CONTAINER, offset, le)
      SelectedFile.NDEF -> {
        val ndefFile = sessionNdefFile ?: byteArrayOf(0x00, 0x00)

        if (offset == 0 && !hasNotifiedRead && ndefFile.size > 2) {
          hasNotifiedRead = true
          onBeingReadCallback?.invoke()
        }

        readFromFile(ndefFile, offset, le)
      }
      SelectedFile.NONE -> SW_FILE_NOT_FOUND
    }
  }

  private fun readFromFile(file: ByteArray, offset: Int, length: Int): ByteArray {
    if (offset >= file.size) return SW_WRONG_PARAMS
    val available = file.size - offset
    val readLen = minOf(length, available)
    return file.copyOfRange(offset, offset + readLen) + SW_OK
  }

  companion object {
    private val NDEF_AID = byteArrayOf(
      0xD2.toByte(), 0x76, 0x00, 0x00,
      0x85.toByte(), 0x01, 0x01
    )

    private const val FILE_ID_CC = 0xE103
    private const val FILE_ID_NDEF = 0xE104

    private const val INS_SELECT: Byte = 0xA4.toByte()
    private const val INS_READ_BINARY: Byte = 0xB0.toByte()

    private const val P1_SELECT_BY_AID: Byte = 0x04
    private const val P1_SELECT_BY_ID: Byte = 0x00

    private val SW_OK = byteArrayOf(0x90.toByte(), 0x00)
    private val SW_FILE_NOT_FOUND = byteArrayOf(0x6A.toByte(), 0x82.toByte())
    private val SW_WRONG_PARAMS = byteArrayOf(0x6A.toByte(), 0x86.toByte())
    private val SW_INS_NOT_SUPPORTED = byteArrayOf(0x6D.toByte(), 0x00)
    private val SW_UNKNOWN = byteArrayOf(0x6F.toByte(), 0x00)

    private val CAPABILITY_CONTAINER = byteArrayOf(
      0x00, 0x0F,
      0x20,
      0x00, 0xFF.toByte(),
      0x00, 0xFF.toByte(),
      0x04,
      0x06,
      0xE1.toByte(), 0x04,
      0x08, 0x00,
      0x00,
      0xFF.toByte()
    )

    @Volatile
    var currentNdefBytes: ByteArray? = null

    @Volatile
    var onBeingReadCallback: (() -> Unit)? = null
  }
}
