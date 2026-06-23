/**
 * Codec for the "device setup" QR code used to provision a new POS device.
 *
 * The web build exports the merchant's credentials as a QR; a POS device scans
 * it to fill both fields in one go. Keys only ever flow web -> POS: native
 * builds never produce this payload, so a POS device can't leak credentials.
 *
 * Keep encode/decode together so producer (export) and consumer (scanner)
 * can't drift.
 */

export interface DeviceSetupPayload {
  merchantId: string;
  customerApiKey: string;
}

// Marker so the scanner can tell our QR apart from any other QR the camera
// happens to see. Bump VERSION if the shape ever changes.
const TYPE = "wpay-keys";
const VERSION = 1;

interface RawPayload {
  v: number;
  t: string;
  m: string;
  k: string;
}

export function encodeDeviceSetupQr(payload: DeviceSetupPayload): string {
  const raw: RawPayload = {
    v: VERSION,
    t: TYPE,
    m: payload.merchantId,
    k: payload.customerApiKey,
  };
  return JSON.stringify(raw);
}

/**
 * Parses a scanned QR string. Returns the credentials only when the payload is
 * a valid, current device-setup QR; returns null for anything else (foreign
 * QRs, malformed JSON, wrong version) so callers can show an error.
 */
export function decodeDeviceSetupQr(raw: string): DeviceSetupPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const candidate = parsed as Partial<RawPayload>;
  if (candidate.t !== TYPE || candidate.v !== VERSION) {
    return null;
  }

  const merchantId = typeof candidate.m === "string" ? candidate.m.trim() : "";
  const customerApiKey =
    typeof candidate.k === "string" ? candidate.k.trim() : "";

  if (!merchantId || !customerApiKey) {
    return null;
  }

  return { merchantId, customerApiKey };
}
