// Extracts the Customer API key from a scanned QR code payload.
//
// The QR format isn't finalized yet, so we currently treat the decoded text as
// the plain key string. Keep this the single place that knows the payload
// shape: when the format is settled (e.g. a URL or JSON wrapper), parse it here
// and the scan flow keeps working unchanged.
export function parseApiKeyQr(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}
