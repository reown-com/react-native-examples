export interface NfcCapabilitiesResult {
  isNfcSupported: boolean;
  isNfcEnabled: boolean;
  isHceSupported: boolean;
}

export type HceEvent = "onTap";
