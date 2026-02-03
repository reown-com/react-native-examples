# NFC Implementation Roadmap for POS App

This document provides a comprehensive implementation plan for adding NFC capabilities to the React Native POS application. It is designed to be self-contained with all technical details needed for implementation.

**Target Repository:** https://github.com/reown-com/react-native-examples/tree/main/dapps/poc-pos-app

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 1: Repository Analysis](#phase-1-repository-analysis)
3. [Phase 2: HCE Detection and NDEF Implementation](#phase-2-hce-detection-and-ndef-implementation)
4. [Phase 3: VAS/Smart Tap Fallback](#phase-3-vasmart-tap-fallback)
5. [Phase 4: UI Updates](#phase-4-ui-updates)
6. [Technical Reference: NDEF Protocol](#technical-reference-ndef-protocol)
7. [Technical Reference: Apple VAS Protocol](#technical-reference-apple-vas-protocol)
8. [Technical Reference: Google Smart Tap Protocol](#technical-reference-google-smart-tap-protocol)
9. [Testing Strategy](#testing-strategy)

---

## Executive Summary

### Goal

Add NFC capability to transmit payment URLs from the POS terminal (React Native app) to customer phones (iOS/Android), with QR code as fallback.

### Strategy (Three-Tier Fallback)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                         NFC IMPLEMENTATION STRATEGY                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  TIER 1: HCE/NDEF Tag Emulation (PREFERRED - Android Only)               │
│  └─► Emulate NFC Type 4 Tag containing URL                               │
│  └─► Works with: iOS (XS+) and Android (5.0+)                            │
│  └─► Response time: ~200ms                                               │
│  └─► No certification required                                           │
│                                                                          │
│  TIER 2: VAS/Smart Tap (FALLBACK - If HCE unavailable)                   │
│  └─► Use Universal VAS AID to detect device type                         │
│  └─► Route to Apple VAS or Google Smart Tap                              │
│  └─► Works with: iOS (6+) and Android with Google Wallet                 │
│  └─► Response time: ~400-600ms                                           │
│  └─► Requires Apple + Google certification                               │
│                                                                          │
│  TIER 3: QR Code (ALWAYS VISIBLE)                                        │
│  └─► Display QR code with payment URL                                    │
│  └─► Works with: ANY phone with camera                                   │
│  └─► Response time: ~2-5 seconds (user-dependent)                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key Constraint

React Native on iOS does NOT support Host Card Emulation (HCE). Therefore:
- **Android POS device**: Can use Tier 1 (HCE) as primary
- **iOS POS device**: Must use Tier 2 (VAS/Smart Tap) or Tier 3 (QR) only

---

## Phase 1: Repository Analysis

### Objective

Understand the existing codebase structure, locate QR code implementation, and identify integration points for NFC.

### Tasks

#### 1.1 Analyze Project Structure

```text
EXPECTED STRUCTURE:
poc-pos-app/
├── api/                    # Backend API integration
├── app/                    # Application screens/routes (Expo Router)
├── assets/                 # Images and static resources
├── components/             # Reusable UI components
├── constants/              # Configuration and constants
├── hooks/                  # Custom React hooks
├── store/                  # State management (likely Zustand or Redux)
├── utils/                  # Helper functions
├── package.json            # Dependencies
├── app.json                # Expo configuration
└── index.ts                # Entry point
```

#### 1.2 Locate QR Code Implementation

Search for:

```text
SEARCH PATTERNS:
- Files: **/QR*.tsx, **/qr*.tsx, **/*Payment*.tsx, **/*Checkout*.tsx
- Imports: 'react-native-qrcode', 'qrcode', 'react-qr-code'
- Components: <QRCode />, <QrCode />, qrcode
- Functions: generateQR, createQR, showQR
```

Expected findings:
- A component that generates QR code from payment URL
- A screen/page that displays the QR code to the merchant
- URL generation logic (likely in utils/ or hooks/)

#### 1.3 Identify Payment URL Structure

**IMPORTANT:** The payment URL base is configured via environment variable:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                    PAYMENT URL CONFIGURATION                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Environment Variable: EXPO_PUBLIC_GATEWAY_URL                           │
│                                                                          │
│  Location: .env file (see .env.example for template)                     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  EXACT URL CONSTRUCTION (use this pattern):                        │  │
│  │                                                                    │  │
│  │  const url = `${process.env.EXPO_PUBLIC_GATEWAY_URL}/?pid=${data.paymentId}`;  │
│  │                                                                    │  │
│  │  Example result:                                                   │  │
│  │  https://gateway.example.com/?pid=abc123-def456-ghi789             │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Key variables:                                                          │
│  • EXPO_PUBLIC_GATEWAY_URL - Base gateway URL from environment           │
│  • data.paymentId - Payment/transaction identifier                       │
│                                                                          │
│  The NFC implementation should use this SAME URL that is currently       │
│  displayed in the QR code.                                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### 1.4 Check Existing NFC Dependencies

Search `package.json` for:

```json
{
  "dependencies": {
    "react-native-nfc-manager": "...",    // Primary NFC library
    "react-native-hce": "...",            // HCE support
    "@anthropic/nfc": "..."               // Any other NFC libs
  }
}
```

#### 1.5 Document Platform Configuration

Check for existing native configuration:
- `android/app/src/main/AndroidManifest.xml` - NFC permissions
- `ios/*/Info.plist` - NFC entitlements
- `app.json` or `expo-plugins` - Expo NFC configuration

### Deliverables for Phase 1

```text
□ File structure map of the repository
□ Location of QR code generation/display component
□ Verify URL pattern: ${EXPO_PUBLIC_GATEWAY_URL}/?pid=${data.paymentId}
□ Locate where 'data.paymentId' is generated/stored
□ List of existing NFC-related dependencies (if any)
□ Platform configuration status (Android/iOS)
□ Identification of state management approach
□ Entry points for NFC integration
```

---

## Phase 2: HCE Detection and NDEF Implementation

### Objective

Implement Host Card Emulation (HCE) to emit NDEF URL records when supported by the device.

### Prerequisites

This phase applies to **Android POS devices only**. iOS does not expose HCE APIs.

### 2.1 Install Dependencies

```bash
# Primary NFC library
npm install react-native-nfc-manager

# HCE support (Android only)
npm install react-native-hce

# TypeScript types
npm install --save-dev @types/react-native-nfc-manager
```

### 2.2 Configure Android Manifest

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- NFC Permissions -->
    <uses-permission android:name="android.permission.NFC" />

    <!-- HCE Feature Declaration -->
    <uses-feature
        android:name="android.hardware.nfc"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.nfc.hce"
        android:required="false" />

    <application ...>

        <!-- HCE Service Declaration -->
        <service
            android:name="com.reactnativehce.services.CardService"
            android:exported="true"
            android:permission="android.permission.BIND_NFC_SERVICE">
            <intent-filter>
                <action android:name="android.nfc.cardemulation.action.HOST_APDU_SERVICE" />
            </intent-filter>
            <meta-data
                android:name="android.nfc.cardemulation.host_apdu_service"
                android:resource="@xml/apduservice" />
        </service>

    </application>
</manifest>
```

### 2.3 Create APDU Service Configuration

Create `android/app/src/main/res/xml/apduservice.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<host-apdu-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/nfc_service_description"
    android:requireDeviceUnlock="false">

    <!-- NDEF Type 4 Tag Application -->
    <aid-group
        android:category="other"
        android:description="@string/nfc_aid_group_description">
        <!-- NDEF Application AID: D2760000850101 -->
        <aid-filter android:name="D2760000850101" />
    </aid-group>

</host-apdu-service>
```

### 2.4 Implement HCE Detection Hook

Create `hooks/useNfcCapabilities.ts`:

```typescript
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

interface NfcCapabilities {
  isNfcSupported: boolean;
  isNfcEnabled: boolean;
  isHceSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useNfcCapabilities(): NfcCapabilities {
  const [capabilities, setCapabilities] = useState<NfcCapabilities>({
    isNfcSupported: false,
    isNfcEnabled: false,
    isHceSupported: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function checkCapabilities() {
      try {
        // iOS does not support HCE
        if (Platform.OS === 'ios') {
          setCapabilities({
            isNfcSupported: true, // Assume true for iOS 11+
            isNfcEnabled: true,
            isHceSupported: false, // iOS never supports HCE
            isLoading: false,
            error: null,
          });
          return;
        }

        // Android NFC checks
        const isSupported = await NfcManager.isSupported();

        if (!isSupported) {
          setCapabilities({
            isNfcSupported: false,
            isNfcEnabled: false,
            isHceSupported: false,
            isLoading: false,
            error: null,
          });
          return;
        }

        const isEnabled = await NfcManager.isEnabled();

        // Check HCE support via package manager feature
        // This requires native module or react-native-device-info
        const hasHceFeature = await checkHceFeature();

        setCapabilities({
          isNfcSupported: isSupported,
          isNfcEnabled: isEnabled,
          isHceSupported: hasHceFeature,
          isLoading: false,
          error: null,
        });

      } catch (error) {
        setCapabilities({
          isNfcSupported: false,
          isNfcEnabled: false,
          isHceSupported: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    checkCapabilities();
  }, []);

  return capabilities;
}

async function checkHceFeature(): Promise<boolean> {
  // Implementation depends on available libraries
  // Option 1: Use react-native-device-info
  // Option 2: Create native module to check PackageManager.FEATURE_NFC_HOST_CARD_EMULATION
  // Option 3: Try to initialize HCE and catch failure

  try {
    // Attempt to import and check HCE
    const HCE = require('react-native-hce').default;
    return HCE !== null;
  } catch {
    return false;
  }
}
```

### 2.5 Implement NDEF URL Record Builder

Create `utils/ndef.ts`:

```typescript
/**
 * NDEF URL Record Builder
 *
 * NDEF (NFC Data Exchange Format) is a binary format for NFC data.
 * This module builds NDEF messages containing URL records.
 *
 * NDEF Record Structure:
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  Byte 0: Header (MB|ME|CF|SR|IL|TNF)                             │
 * │  Byte 1: Type Length                                             │
 * │  Byte 2: Payload Length (1 byte if SR=1, else 4 bytes)           │
 * │  Byte 3: Type ("U" = 0x55 for URI)                               │
 * │  Byte 4: URI Prefix Code                                         │
 * │  Byte 5+: URI String (without prefix)                            │
 * └──────────────────────────────────────────────────────────────────┘
 */

// URI Prefix Codes (saves space by abbreviating common prefixes)
const URI_PREFIXES: Record<string, number> = {
  '': 0x00,                          // No prefix (raw URI)
  'http://www.': 0x01,
  'https://www.': 0x02,
  'http://': 0x03,
  'https://': 0x04,
  'tel:': 0x05,
  'mailto:': 0x06,
  'ftp://anonymous:anonymous@': 0x07,
  'ftp://ftp.': 0x08,
  'ftps://': 0x09,
  'sftp://': 0x0A,
};

// Header flags
const MB = 0x80;  // Message Begin
const ME = 0x40;  // Message End
const SR = 0x10;  // Short Record (payload < 256 bytes)
const TNF_WELL_KNOWN = 0x01;  // Type Name Format: NFC Forum well-known type

/**
 * Build an NDEF message containing a single URI record
 */
export function buildNdefUrlMessage(url: string): Uint8Array {
  // Find matching prefix
  let prefixCode = 0x00;
  let urlWithoutPrefix = url;

  for (const [prefix, code] of Object.entries(URI_PREFIXES)) {
    if (prefix && url.startsWith(prefix)) {
      prefixCode = code;
      urlWithoutPrefix = url.slice(prefix.length);
      break;
    }
  }

  // Convert URL to bytes
  const urlBytes = new TextEncoder().encode(urlWithoutPrefix);

  // Payload = prefix code + URL bytes
  const payloadLength = 1 + urlBytes.length;

  if (payloadLength > 255) {
    throw new Error('URL too long for short record format');
  }

  // Build NDEF record
  const header = MB | ME | SR | TNF_WELL_KNOWN;
  const typeLength = 1;  // "U" is 1 byte
  const type = 0x55;     // "U" for URI

  // Assemble record
  const record = new Uint8Array(4 + payloadLength);
  record[0] = header;
  record[1] = typeLength;
  record[2] = payloadLength;
  record[3] = type;
  record[4] = prefixCode;
  record.set(urlBytes, 5);

  return record;
}

/**
 * Build complete NDEF file content (with 2-byte length prefix)
 * This is what gets stored in the Type 4 Tag NDEF file
 */
export function buildNdefFile(url: string): Uint8Array {
  const ndefMessage = buildNdefUrlMessage(url);

  // NDEF file format: 2-byte length + NDEF message
  const ndefFile = new Uint8Array(2 + ndefMessage.length);

  // Big-endian length
  ndefFile[0] = (ndefMessage.length >> 8) & 0xFF;
  ndefFile[1] = ndefMessage.length & 0xFF;

  // NDEF message
  ndefFile.set(ndefMessage, 2);

  return ndefFile;
}

/**
 * Example:
 *
 * URL: "https://pay.example.com/s/ABC123"
 *
 * Prefix: 0x04 (https://)
 * Remaining: "pay.example.com/s/ABC123"
 *
 * NDEF Record (hex):
 * D1 01 19 55 04 70 61 79 2E 65 78 61 6D 70 6C 65
 * 2E 63 6F 6D 2F 73 2F 41 42 43 31 32 33
 *
 * Breakdown:
 * D1 = Header (MB=1, ME=1, SR=1, TNF=01)
 * 01 = Type Length (1 byte)
 * 19 = Payload Length (25 bytes)
 * 55 = Type "U" (URI)
 * 04 = Prefix code (https://)
 * 70... = "pay.example.com/s/ABC123"
 */
```

### 2.6 Implement HCE Service

Create `services/HceService.ts`:

```typescript
import { Platform } from 'react-native';
import { buildNdefFile } from '../utils/ndef';

// Type 4 Tag constants
const NDEF_APP_AID = 'D2760000850101';
const CC_FILE_ID = 'E103';
const NDEF_FILE_ID = 'E104';

// Capability Container (15 bytes)
// Describes tag capabilities to the reader
const CAPABILITY_CONTAINER = new Uint8Array([
  0x00, 0x0F,       // CC length (15 bytes)
  0x20,             // Mapping version 2.0
  0x00, 0xFF,       // MLe (max read length) = 255
  0x00, 0xFF,       // MLc (max write length) = 255
  0x04,             // NDEF File Control TLV - Type
  0x06,             // NDEF File Control TLV - Length
  0xE1, 0x04,       // NDEF File ID
  0x08, 0x00,       // Max NDEF size (2048 bytes)
  0x00,             // Read access: no security
  0xFF,             // Write access: no write allowed
]);

// Status words
const SW_OK = [0x90, 0x00];
const SW_NOT_FOUND = [0x6A, 0x82];
const SW_WRONG_PARAMS = [0x6A, 0x86];

interface HceState {
  selectedFile: 'none' | 'cc' | 'ndef';
  ndefFile: Uint8Array | null;
}

class HceServiceClass {
  private state: HceState = {
    selectedFile: 'none',
    ndefFile: null,
  };

  private hceInstance: any = null;
  private isRunning = false;

  /**
   * Start HCE with the given payment URL
   */
  async start(paymentUrl: string): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('HCE is only supported on Android');
      return false;
    }

    try {
      // Build NDEF file with URL
      this.state.ndefFile = buildNdefFile(paymentUrl);
      this.state.selectedFile = 'none';

      // Initialize HCE
      const HCE = require('react-native-hce').default;

      this.hceInstance = await HCE.getInstance();

      // Set up APDU handler
      this.hceInstance.on('apdu', this.handleApdu.bind(this));

      // Start emulation
      await this.hceInstance.start();
      this.isRunning = true;

      console.log('HCE started with URL:', paymentUrl);
      return true;

    } catch (error) {
      console.error('Failed to start HCE:', error);
      return false;
    }
  }

  /**
   * Stop HCE emulation
   */
  async stop(): Promise<void> {
    if (this.hceInstance && this.isRunning) {
      await this.hceInstance.stop();
      this.isRunning = false;
      this.state.selectedFile = 'none';
      console.log('HCE stopped');
    }
  }

  /**
   * Update the payment URL while running
   */
  updateUrl(paymentUrl: string): void {
    this.state.ndefFile = buildNdefFile(paymentUrl);
    console.log('HCE URL updated:', paymentUrl);
  }

  /**
   * Handle incoming APDU commands from NFC reader (iPhone/Android phone)
   *
   * Type 4 Tag command flow:
   * 1. SELECT NDEF Application (AID: D2760000850101)
   * 2. SELECT Capability Container (File: E103)
   * 3. READ BINARY (read CC)
   * 4. SELECT NDEF File (File: E104)
   * 5. READ BINARY (read NDEF length, then NDEF message)
   */
  private handleApdu(apdu: number[]): number[] {
    const command = this.parseApdu(apdu);

    switch (command.type) {
      case 'SELECT_AID':
        return this.handleSelectAid(command.data);

      case 'SELECT_FILE':
        return this.handleSelectFile(command.data);

      case 'READ_BINARY':
        return this.handleReadBinary(command.offset, command.length);

      default:
        return SW_WRONG_PARAMS;
    }
  }

  private parseApdu(apdu: number[]): {
    type: string;
    data: number[];
    offset: number;
    length: number;
  } {
    const cla = apdu[0];
    const ins = apdu[1];
    const p1 = apdu[2];
    const p2 = apdu[3];
    const lc = apdu[4] || 0;
    const data = apdu.slice(5, 5 + lc);

    // SELECT command
    if (cla === 0x00 && ins === 0xA4) {
      if (p1 === 0x04 && p2 === 0x00) {
        return { type: 'SELECT_AID', data, offset: 0, length: 0 };
      }
      if (p1 === 0x00 && p2 === 0x0C) {
        return { type: 'SELECT_FILE', data, offset: 0, length: 0 };
      }
    }

    // READ BINARY command
    if (cla === 0x00 && ins === 0xB0) {
      const offset = (p1 << 8) | p2;
      const length = apdu[apdu.length - 1] || 0;
      return { type: 'READ_BINARY', data: [], offset, length };
    }

    return { type: 'UNKNOWN', data: [], offset: 0, length: 0 };
  }

  private handleSelectAid(data: number[]): number[] {
    const aidHex = Array.from(data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    if (aidHex === NDEF_APP_AID) {
      this.state.selectedFile = 'none';
      return SW_OK;
    }

    return SW_NOT_FOUND;
  }

  private handleSelectFile(data: number[]): number[] {
    const fileId = ((data[0] << 8) | data[1])
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');

    if (fileId === CC_FILE_ID) {
      this.state.selectedFile = 'cc';
      return SW_OK;
    }

    if (fileId === NDEF_FILE_ID) {
      this.state.selectedFile = 'ndef';
      return SW_OK;
    }

    return SW_NOT_FOUND;
  }

  private handleReadBinary(offset: number, length: number): number[] {
    let fileData: Uint8Array;

    switch (this.state.selectedFile) {
      case 'cc':
        fileData = CAPABILITY_CONTAINER;
        break;

      case 'ndef':
        if (!this.state.ndefFile) {
          return SW_NOT_FOUND;
        }
        fileData = this.state.ndefFile;
        break;

      default:
        return SW_NOT_FOUND;
    }

    // Handle read request
    const end = Math.min(offset + length, fileData.length);
    const responseData = Array.from(fileData.slice(offset, end));

    return [...responseData, ...SW_OK];
  }
}

export const HceService = new HceServiceClass();
```

### 2.7 Create NFC Payment Hook

Create `hooks/useNfcPayment.ts`:

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import { useNfcCapabilities } from './useNfcCapabilities';
import { HceService } from '../services/HceService';

interface UseNfcPaymentOptions {
  paymentUrl: string;
  enabled: boolean;
  onNfcRead?: () => void;
  onNfcError?: (error: Error) => void;
}

interface UseNfcPaymentReturn {
  isNfcActive: boolean;
  isHceMode: boolean;
  startNfc: () => Promise<void>;
  stopNfc: () => Promise<void>;
  updateUrl: (url: string) => void;
}

export function useNfcPayment(options: UseNfcPaymentOptions): UseNfcPaymentReturn {
  const { paymentUrl, enabled, onNfcRead, onNfcError } = options;
  const capabilities = useNfcCapabilities();
  const isActiveRef = useRef(false);
  const currentUrlRef = useRef(paymentUrl);

  // Update URL ref when it changes
  useEffect(() => {
    currentUrlRef.current = paymentUrl;
    if (isActiveRef.current && capabilities.isHceSupported) {
      HceService.updateUrl(paymentUrl);
    }
  }, [paymentUrl, capabilities.isHceSupported]);

  const startNfc = useCallback(async () => {
    if (!enabled || capabilities.isLoading) return;

    try {
      if (capabilities.isHceSupported) {
        // Use HCE (Tier 1)
        const success = await HceService.start(currentUrlRef.current);
        if (success) {
          isActiveRef.current = true;
        } else {
          throw new Error('Failed to start HCE');
        }
      } else {
        // HCE not available - will need Tier 2 (VAS/Smart Tap)
        // or rely on QR code (Tier 3)
        console.log('HCE not supported, using fallback');
      }
    } catch (error) {
      onNfcError?.(error instanceof Error ? error : new Error('NFC error'));
    }
  }, [enabled, capabilities, onNfcError]);

  const stopNfc = useCallback(async () => {
    if (capabilities.isHceSupported) {
      await HceService.stop();
    }
    isActiveRef.current = false;
  }, [capabilities.isHceSupported]);

  const updateUrl = useCallback((url: string) => {
    currentUrlRef.current = url;
    if (isActiveRef.current && capabilities.isHceSupported) {
      HceService.updateUrl(url);
    }
  }, [capabilities.isHceSupported]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && enabled) {
        startNfc();
      } else if (state === 'background') {
        // Keep HCE running in background for Android
        // iOS will suspend automatically
      }
    });

    return () => subscription.remove();
  }, [enabled, startNfc]);

  // Start/stop based on enabled state
  useEffect(() => {
    if (enabled && !capabilities.isLoading) {
      startNfc();
    } else {
      stopNfc();
    }

    return () => {
      stopNfc();
    };
  }, [enabled, capabilities.isLoading, startNfc, stopNfc]);

  return {
    isNfcActive: isActiveRef.current,
    isHceMode: capabilities.isHceSupported,
    startNfc,
    stopNfc,
    updateUrl,
  };
}
```

### Deliverables for Phase 2

```text
□ react-native-nfc-manager and react-native-hce installed
□ Android manifest configured with NFC permissions and HCE service
□ APDU service XML configuration created
□ useNfcCapabilities hook implemented
□ NDEF URL record builder (utils/ndef.ts) implemented
□ HCE service with APDU handler implemented
□ useNfcPayment hook created
□ HCE tested on Android device
```

---

## Phase 3: VAS/Smart Tap Fallback

### Objective

Implement Apple VAS and Google Smart Tap as fallback when HCE is not available.

### Important Note on Feasibility

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                    ⚠️  CRITICAL LIMITATION                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Apple VAS and Google Smart Tap require the device to act as an         │
│  NFC READER, not a tag/card.                                            │
│                                                                          │
│  React Native limitations:                                               │
│  • iOS: CoreNFC can only READ tags, not act as reader for VAS           │
│  • Android: Can read tags but VAS requires ECP polling support          │
│                                                                          │
│  To implement Tier 2 (VAS/Smart Tap), you need:                          │
│  1. External VAS-certified USB NFC reader (WalletMate, VTAP, etc.)      │
│     OR                                                                   │
│  2. POS hardware with VAS SDK (Zebra, Ingenico, etc.)                   │
│     OR                                                                   │
│  3. Native module with low-level NFC controller access                  │
│                                                                          │
│  For a React Native app running on standard phone/tablet:               │
│  → Tier 2 is NOT directly implementable                                  │
│  → Skip to Tier 3 (QR Code) as fallback                                  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.1 External NFC Reader Integration (Optional)

If using an external VAS-certified USB NFC reader:

```typescript
/**
 * External VAS Reader Integration
 *
 * This would require a native module to communicate with USB NFC reader.
 * The reader handles ECP polling and VAS protocol.
 *
 * Supported readers:
 * - ACS WalletMate / WalletMate II
 * - VTAP VAS Readers
 * - ID TECH PiP
 */

interface VasReaderConfig {
  applePassTypeId: string;      // Your registered Pass Type ID
  applePrivateKey: string;      // P-256 private key (PEM)
  googleCollectorId: string;    // Google Smart Tap Collector ID
  googlePrivateKey: string;     // P-256 private key (PEM)
  signupUrl: string;            // URL to send in VAS URL mode
}

// This would be implemented as a native module
// communicating with USB reader via serial/USB API
```

### 3.2 VAS Protocol Reference (For Native Implementation)

If implementing at the native level or with external reader:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL VAS AID DETECTION                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: SELECT Universal VAS AID                                        │
│  Command: 00 A4 04 00 0A 4F53452E5641532E3031 00                         │
│           ││ ││ ││ ││ ││ └─────────────────┘ └── Le                      │
│           ││ ││ ││ ││ └── Lc (10 bytes)                                  │
│           ││ ││ ││ └── P2 (first or only occurrence)                     │
│           ││ ││ └── P1 (select by name)                                  │
│           ││ └── INS (SELECT)                                            │
│           └── CLA                                                        │
│                                                                          │
│  AID: 4F 53 45 2E 56 41 53 2E 30 31 = "OSE.VAS.01"                       │
│                                                                          │
│  STEP 2: Check Response Tag 50 for Wallet Type                           │
│                                                                          │
│  Apple Device:                                                           │
│    Tag 50: 41 70 70 6C 65 50 61 79 = "ApplePay"                          │
│    → Proceed with Apple VAS protocol                                     │
│                                                                          │
│  Android Device:                                                         │
│    Tag 50: 41 6E 64 72 6F 69 64 50 61 79 = "AndroidPay"                  │
│    → Proceed with Google Smart Tap protocol                              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Simplified Approach: Skip to QR Fallback

For standard React Native app without external hardware:

```typescript
/**
 * NFC Strategy Decision Hook
 *
 * Determines the best available NFC strategy based on device capabilities.
 */

type NfcStrategy = 'hce' | 'qr-only';

export function useNfcStrategy(): {
  strategy: NfcStrategy;
  reason: string;
} {
  const capabilities = useNfcCapabilities();

  if (capabilities.isLoading) {
    return { strategy: 'qr-only', reason: 'Loading...' };
  }

  if (capabilities.isHceSupported) {
    return {
      strategy: 'hce',
      reason: 'HCE supported - using NDEF tag emulation'
    };
  }

  // VAS/Smart Tap requires external reader or native SDK
  // Fall back to QR code
  return {
    strategy: 'qr-only',
    reason: 'HCE not supported - using QR code fallback'
  };
}
```

### Deliverables for Phase 3

```text
□ Document VAS/Smart Tap limitation for React Native
□ Implement NFC strategy decision hook
□ (Optional) Research external USB reader integration
□ (Optional) Implement native module for external reader
□ Ensure graceful fallback to QR code
```

---

## Phase 4: UI Updates

### Objective

Update the payment UI to show both NFC tap option and QR code, with appropriate messaging based on device capabilities.

### 4.1 Payment Screen Component

Create or update `components/PaymentScreen.tsx`:

```tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg'; // or your existing QR library
import { useNfcPayment } from '../hooks/useNfcPayment';
import { useNfcCapabilities } from '../hooks/useNfcCapabilities';

interface PaymentScreenProps {
  paymentUrl: string;
  amount: string;
  currency: string;
  onPaymentComplete?: () => void;
}

export function PaymentScreen({
  paymentUrl,
  amount,
  currency,
  onPaymentComplete,
}: PaymentScreenProps) {
  const capabilities = useNfcCapabilities();
  const { isNfcActive, isHceMode } = useNfcPayment({
    paymentUrl,
    enabled: true,
  });

  // Pulse animation for NFC icon
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isNfcActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isNfcActive, pulseAnim]);

  const showNfcOption = capabilities.isNfcSupported && !capabilities.isLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payment Request</Text>
        <Text style={styles.amount}>
          {currency} {amount}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Instruction */}
        <Text style={styles.instruction}>
          {showNfcOption
            ? 'Tap your phone or scan the QR code'
            : 'Scan the QR code to pay'}
        </Text>

        {/* NFC + QR Side by Side (or stacked on small screens) */}
        <View style={styles.optionsContainer}>
          {/* NFC Option */}
          {showNfcOption && (
            <View style={styles.nfcOption}>
              <Animated.View
                style={[
                  styles.nfcIconContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <NfcIcon active={isNfcActive} />
              </Animated.View>
              <Text style={styles.optionLabel}>Tap here</Text>
              {isNfcActive && (
                <Text style={styles.nfcStatus}>
                  {isHceMode ? 'NFC Ready' : 'Waiting...'}
                </Text>
              )}
            </View>
          )}

          {/* Divider */}
          {showNfcOption && (
            <View style={styles.divider}>
              <Text style={styles.dividerText}>or</Text>
            </View>
          )}

          {/* QR Code Option */}
          <View style={styles.qrOption}>
            <View style={styles.qrContainer}>
              <QRCode
                value={paymentUrl}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>
            <Text style={styles.optionLabel}>Scan QR code</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Waiting for payment...
        </Text>
      </View>
    </View>
  );
}

// NFC Icon Component
function NfcIcon({ active }: { active: boolean }) {
  return (
    <View style={[styles.nfcIcon, active && styles.nfcIconActive]}>
      {/* Replace with actual NFC icon SVG or image */}
      <Text style={styles.nfcIconText}>📱</Text>
      <View style={styles.nfcWaves}>
        <View style={[styles.wave, styles.wave1]} />
        <View style={[styles.wave, styles.wave2]} />
        <View style={[styles.wave, styles.wave3]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  nfcOption: {
    alignItems: 'center',
    padding: 16,
  },
  nfcIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nfcIcon: {
    alignItems: 'center',
  },
  nfcIconActive: {
    // Active state styling
  },
  nfcIconText: {
    fontSize: 48,
  },
  nfcWaves: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  wave: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#0066cc',
    borderRadius: 100,
    opacity: 0.3,
  },
  wave1: {
    width: '60%',
    height: '60%',
    top: '20%',
    left: '20%',
  },
  wave2: {
    width: '80%',
    height: '80%',
    top: '10%',
    left: '10%',
  },
  wave3: {
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  optionLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  nfcStatus: {
    fontSize: 14,
    color: '#0066cc',
    marginTop: 4,
  },
  divider: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  dividerText: {
    fontSize: 16,
    color: '#999',
  },
  qrOption: {
    alignItems: 'center',
    padding: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});
```

### 4.2 Status Indicator Component

Create `components/NfcStatusIndicator.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNfcCapabilities } from '../hooks/useNfcCapabilities';

export function NfcStatusIndicator() {
  const capabilities = useNfcCapabilities();

  if (capabilities.isLoading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={styles.text}>Checking NFC...</Text>
      </View>
    );
  }

  if (!capabilities.isNfcSupported) {
    return (
      <View style={[styles.container, styles.unsupported]}>
        <Text style={styles.text}>NFC not available</Text>
      </View>
    );
  }

  if (!capabilities.isNfcEnabled) {
    return (
      <View style={[styles.container, styles.disabled]}>
        <Text style={styles.text}>NFC disabled - enable in settings</Text>
      </View>
    );
  }

  if (capabilities.isHceSupported) {
    return (
      <View style={[styles.container, styles.ready]}>
        <Text style={styles.text}>NFC Ready (HCE)</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.limited]}>
      <Text style={styles.text}>NFC Limited (QR fallback)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loading: {
    backgroundColor: '#e0e0e0',
  },
  unsupported: {
    backgroundColor: '#ffebee',
  },
  disabled: {
    backgroundColor: '#fff3e0',
  },
  ready: {
    backgroundColor: '#e8f5e9',
  },
  limited: {
    backgroundColor: '#e3f2fd',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
```

### 4.3 Integration with Existing Flow

Identify where in the app the payment/checkout screen is shown and integrate:

```tsx
// Example integration in existing payment flow

import { PaymentScreen } from '../components/PaymentScreen';

function CheckoutPage() {
  const { data, amount, currency } = usePaymentSession();

  // Construct payment URL using the EXACT same pattern as existing QR code
  // URL format: ${EXPO_PUBLIC_GATEWAY_URL}/?pid=${paymentId}
  const paymentUrl = `${process.env.EXPO_PUBLIC_GATEWAY_URL}/?pid=${data.paymentId}`;

  // ... existing checkout logic

  return (
    <PaymentScreen
      paymentUrl={paymentUrl}  // Same URL used for QR code AND NFC
      amount={amount}
      currency={currency}
      onPaymentComplete={() => {
        // Handle successful payment
        navigation.navigate('Success');
      }}
    />
  );
}
```

### Deliverables for Phase 4

```text
□ PaymentScreen component with NFC + QR display
□ NfcStatusIndicator component for showing NFC state
□ Pulse animation for NFC icon when active
□ Responsive layout for different screen sizes
□ Integration with existing checkout flow
□ Proper handling of NFC capability states
□ User-friendly error messages
```

---

## Technical Reference: NDEF Protocol

### NDEF Message Structure

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      NDEF MESSAGE FORMAT                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  An NDEF message contains one or more NDEF records:                      │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐       ┌─────────────┐                  │
│  │  Record 1   │  │  Record 2   │  ...  │  Record N   │                  │
│  │  (MB=1)     │  │             │       │  (ME=1)     │                  │
│  └─────────────┘  └─────────────┘       └─────────────┘                  │
│                                                                          │
│  MB = Message Begin (set on first record)                                │
│  ME = Message End (set on last record)                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### NDEF Record Header

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      NDEF RECORD HEADER BYTE                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Bit 7: MB  (Message Begin)     - 1 if first record in message          │
│  Bit 6: ME  (Message End)       - 1 if last record in message           │
│  Bit 5: CF  (Chunk Flag)        - 1 if chunked (rarely used)            │
│  Bit 4: SR  (Short Record)      - 1 if payload length is 1 byte         │
│  Bit 3: IL  (ID Length present) - 1 if ID field is present              │
│  Bits 2-0: TNF (Type Name Format)                                       │
│                                                                          │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐                       │
│  │ MB  │ ME  │ CF  │ SR  │ IL  │    T N F      │                        │
│  │ b7  │ b6  │ b5  │ b4  │ b3  │ b2  │ b1  │ b0 │                        │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘                       │
│                                                                          │
│  TNF Values:                                                             │
│  0x00 = Empty                                                            │
│  0x01 = NFC Forum well-known type (used for URI)                         │
│  0x02 = Media-type (RFC 2046)                                            │
│  0x03 = Absolute URI                                                     │
│  0x04 = External type                                                    │
│  0x05 = Unknown                                                          │
│  0x06 = Unchanged (for chunks)                                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### URI Record Format

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      NDEF URI RECORD FORMAT                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  For a single URI record (most common case):                             │
│                                                                          │
│  Byte 0:    Header = 0xD1                                                │
│             (MB=1, ME=1, CF=0, SR=1, IL=0, TNF=0x01)                     │
│                                                                          │
│  Byte 1:    Type Length = 0x01 (type is "U", 1 byte)                     │
│                                                                          │
│  Byte 2:    Payload Length (1 byte for SR=1)                             │
│                                                                          │
│  Byte 3:    Type = 0x55 ("U" in ASCII)                                   │
│                                                                          │
│  Byte 4:    URI Prefix Code (see table below)                            │
│                                                                          │
│  Byte 5+:   URI string (without the prefix)                              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  URI PREFIX CODES                                                  │  │
│  ├──────┬─────────────────────────────────────────────────────────────┤  │
│  │ Code │ Prefix                                                      │  │
│  ├──────┼─────────────────────────────────────────────────────────────┤  │
│  │ 0x00 │ (none - raw URI)                                            │  │
│  │ 0x01 │ http://www.                                                 │  │
│  │ 0x02 │ https://www.                                                │  │
│  │ 0x03 │ http://                                                     │  │
│  │ 0x04 │ https://                                                    │  │
│  │ 0x05 │ tel:                                                        │  │
│  │ 0x06 │ mailto:                                                     │  │
│  └──────┴─────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Example: Building URL Record

```text
URL: https://pay.example.com/session/ABC123

Step 1: Find prefix
  - URL starts with "https://"
  - Prefix code: 0x04
  - Remaining: "pay.example.com/session/ABC123" (30 bytes)

Step 2: Build record
  - Header: 0xD1 (MB=1, ME=1, SR=1, TNF=01)
  - Type Length: 0x01
  - Payload Length: 0x1F (31 = 1 prefix + 30 chars)
  - Type: 0x55 ("U")
  - Prefix: 0x04
  - Data: "pay.example.com/session/ABC123"

Step 3: Hex result
  D1 01 1F 55 04 70 61 79 2E 65 78 61 6D 70 6C 65
  2E 63 6F 6D 2F 73 65 73 73 69 6F 6E 2F 41 42 43
  31 32 33

Step 4: Add NDEF file length prefix (for Type 4 Tag)
  00 22 D1 01 1F 55 04 70 61 79 2E 65 78 61 6D 70
  6C 65 2E 63 6F 6D 2F 73 65 73 73 69 6F 6E 2F 41
  42 43 31 32 33

  (00 22 = length of 34 bytes)
```

### Type 4 Tag APDU Commands

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      TYPE 4 TAG APDU COMMANDS                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. SELECT NDEF Application                                              │
│     Command:  00 A4 04 00 07 D2760000850101 00                           │
│     Response: 90 00 (OK)                                                 │
│                                                                          │
│  2. SELECT Capability Container                                          │
│     Command:  00 A4 00 0C 02 E103                                        │
│     Response: 90 00 (OK)                                                 │
│                                                                          │
│  3. READ BINARY (Capability Container)                                   │
│     Command:  00 B0 00 00 0F                                             │
│     Response: [15 bytes CC data] 90 00                                   │
│                                                                          │
│  4. SELECT NDEF File                                                     │
│     Command:  00 A4 00 0C 02 E104                                        │
│     Response: 90 00 (OK)                                                 │
│                                                                          │
│  5. READ BINARY (NDEF Length)                                            │
│     Command:  00 B0 00 00 02                                             │
│     Response: [2 bytes length] 90 00                                     │
│                                                                          │
│  6. READ BINARY (NDEF Message)                                           │
│     Command:  00 B0 00 02 [length]                                       │
│     Response: [NDEF message] 90 00                                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Reference: Apple VAS Protocol

### Overview

Apple VAS (Value Added Services) is Apple's proprietary NFC protocol for wallet passes and loyalty programs.

**Important:** VAS requires the device to be an NFC **reader** with ECP (Enhanced Contactless Polling) support. Standard phones cannot act as VAS readers.

### VAS Application Selection

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      APPLE VAS PROTOCOL                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  VAS AID: 4F 53 45 2E 56 41 53 2E 30 31 ("OSE.VAS.01")                   │
│                                                                          │
│  SELECT Command:                                                         │
│  00 A4 04 00 0A 4F53452E5641532E3031 00                                  │
│  ││ ││ ││ ││ ││ └─────────────────┘ └── Le                               │
│  ││ ││ ││ ││ └── Lc (10 bytes)                                           │
│  ││ ││ ││ └── P2                                                         │
│  ││ ││ └── P1 (select by name)                                           │
│  ││ └── INS (SELECT)                                                     │
│  └── CLA                                                                 │
│                                                                          │
│  Response includes:                                                      │
│  - Tag 50: Application label ("ApplePay" = 4170706C65506179)             │
│  - Tag 9F21: Mobile capabilities                                         │
│  - SW: 90 00 (success)                                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### VAS URL Mode

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      VAS URL MODE (P2=0x00)                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  GET VAS DATA Command:                                                   │
│  80 CA 01 00 [Lc] [Data]                                                 │
│  ││ ││ ││ ││                                                             │
│  ││ ││ ││ └── P2 = 0x00 (URL Mode)                                       │
│  ││ ││ └── P1 = 0x01 (Version 1)                                         │
│  ││ └── INS (GET DATA)                                                   │
│  └── CLA (proprietary)                                                   │
│                                                                          │
│  Data TLV Structure:                                                     │
│  - Tag 9F25: Merchant ID (SHA-256 of Pass Type ID, 32 bytes)             │
│  - Tag 9F22: Signup URL (ASCII string)                                   │
│  - Tag 9F26: Terminal ephemeral public key (65 bytes, uncompressed)      │
│                                                                          │
│  Response:                                                               │
│  - SW: 90 00 (success, notification displayed)                           │
│  - SW: 6A 83 (pass not available)                                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### ECP (Enhanced Contactless Polling)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      ECP FRAME FORMAT                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ECP enables frictionless "tap and go" by broadcasting terminal          │
│  capabilities during NFC polling.                                        │
│                                                                          │
│  Frame Structure:                                                        │
│  ┌────────┬─────────┬────────────────────────────────────┬──────────┐    │
│  │ Header │ Version │          Payload                   │   CRC    │    │
│  │  0x6A  │ 01 / 02 │  TCI + Terminal Info               │ ISO14443 │    │
│  └────────┴─────────┴────────────────────────────────────┴──────────┘    │
│                                                                          │
│  TCI (Terminal Capabilities Identifier):                                 │
│  - 00 00 01: VAS and Payment                                             │
│  - 00 00 02: VAS Only                                                    │
│  - 00 00 03: Payment Only                                                │
│                                                                          │
│  Timing:                                                                 │
│  - Polling interval: 100-250ms optimal                                   │
│  - Guard time: 5ms between frames                                        │
│  - Processing delay: ~76ms                                               │
│  - Grace period: 300ms (payment), 750ms (transit)                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Reference: Google Smart Tap Protocol

### Overview

Google Smart Tap is Google's proprietary NFC protocol for Google Wallet passes.

### Smart Tap Detection

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      GOOGLE SMART TAP PROTOCOL                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Smart Tap also responds to Universal VAS AID:                           │
│  AID: 4F 53 45 2E 56 41 53 2E 30 31 ("OSE.VAS.01")                       │
│                                                                          │
│  Detection:                                                              │
│  - SELECT OSE.VAS.01                                                     │
│  - Check Tag 50 in response                                              │
│  - If "AndroidPay" (416E64726F6964506179) → Smart Tap device             │
│                                                                          │
│  Protocol Flow:                                                          │
│  1. SELECT applet                                                        │
│  2. NEGOTIATE SECURE CHANNEL (ECDH key exchange)                         │
│  3. GET DATA (retrieve pass information)                                 │
│  4. GET MORE DATA (if continuation needed, SW=91 00)                     │
│                                                                          │
│  Security:                                                               │
│  - ECDH key derivation for session keys                                  │
│  - AES encryption for pass data                                          │
│  - Collector ID identifies the reader/merchant                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Smart Tap vs Apple VAS

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      PROTOCOL COMPARISON                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Feature              │ Apple VAS           │ Google Smart Tap           │
│  ─────────────────────┼─────────────────────┼────────────────────────────│
│  AID                  │ OSE.VAS.01          │ OSE.VAS.01 (same!)         │
│  Detection            │ Tag 50 = "ApplePay" │ Tag 50 = "AndroidPay"      │
│  ECP Required         │ Yes (mandatory)     │ No                         │
│  URL Push Mode        │ Yes (P2=0x00)       │ No direct equivalent       │
│  Encryption           │ ECDH + AES-GCM      │ ECDH + AES                 │
│  Key Size             │ P-256               │ P-256                      │
│  Certification        │ Apple NFC cert      │ Google enrollment          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Testing Strategy

### 9.1 Unit Tests

```typescript
// Test NDEF URL building
describe('NDEF URL Builder', () => {
  it('should build correct NDEF record for https URL', () => {
    const url = 'https://pay.example.com/s/123';
    const record = buildNdefUrlMessage(url);

    expect(record[0]).toBe(0xD1); // Header
    expect(record[3]).toBe(0x55); // Type "U"
    expect(record[4]).toBe(0x04); // https:// prefix
  });

  it('should handle URL without known prefix', () => {
    const url = 'custom://app/path';
    const record = buildNdefUrlMessage(url);

    expect(record[4]).toBe(0x00); // No prefix
  });
});
```

### 9.2 Integration Tests

```text
TEST SCENARIOS:

1. HCE Available (Android)
   - Start HCE with URL
   - Verify APDU responses
   - Test URL update while running
   - Test stop/restart

2. HCE Not Available (iOS or restricted Android)
   - Verify graceful fallback to QR
   - Verify UI shows correct state

3. QR Code Fallback
   - Verify QR contains correct URL
   - Verify QR is readable by camera apps

4. UI States
   - Loading state
   - NFC ready state
   - NFC disabled state
   - Error states
```

### 9.3 Device Testing Matrix

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      DEVICE TESTING MATRIX                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  POS Device              │ Customer Device      │ Expected Behavior      │
│  ────────────────────────┼──────────────────────┼────────────────────────│
│  Android (HCE enabled)   │ iPhone XS+           │ NDEF notification      │
│  Android (HCE enabled)   │ iPhone 6-X           │ QR fallback only       │
│  Android (HCE enabled)   │ Android 5.0+         │ NDEF notification      │
│  Android (no HCE)        │ Any                  │ QR fallback only       │
│  iOS                     │ Any                  │ QR fallback only       │
│                                                                          │
│  Notes:                                                                  │
│  - iPhone XS+ = A12 chip, supports Background Tag Reading                │
│  - iPhone 6-X can read NDEF but requires app to be open                  │
│  - Android NDEF reading works in background with NFC enabled             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 9.4 Test Commands

```bash
# Run unit tests
npm test

# Run on Android device
npm run android

# Run on iOS device (for QR fallback testing)
npm run ios

# Check NFC hardware (Android only)
adb shell dumpsys nfc
```

---

## Summary Checklist

```text
PHASE 1: Repository Analysis
□ Clone and explore repository structure
□ Locate QR code implementation
□ Document payment URL format
□ Check existing NFC dependencies
□ Review platform configurations

PHASE 2: HCE Implementation
□ Install react-native-nfc-manager and react-native-hce
□ Configure Android manifest
□ Create APDU service configuration
□ Implement useNfcCapabilities hook
□ Implement NDEF URL builder (utils/ndef.ts)
□ Implement HCE service
□ Create useNfcPayment hook
□ Test on Android device

PHASE 3: Fallback Strategy
□ Document VAS/Smart Tap limitations
□ Implement strategy decision hook
□ Ensure QR code fallback works

PHASE 4: UI Updates
□ Create PaymentScreen component
□ Create NfcStatusIndicator component
□ Add NFC icon with animation
□ Integrate with existing flow
□ Test on multiple devices
```

---

## References

- [react-native-nfc-manager](https://github.com/revtel/react-native-nfc-manager)
- [react-native-hce](https://github.com/nicklockwood/react-native-hce)
- [NFC Forum Type 4 Tag Specification](https://nfc-forum.org/our-work/specification-releases/)
- [Apple VAS Research (kormax)](https://github.com/kormax/apple-vas)
- [Google Smart Tap Research (kormax)](https://github.com/kormax/google-smart-tap)
- [Apple ECP Research (kormax)](https://github.com/kormax/apple-enhanced-contactless-polling)
