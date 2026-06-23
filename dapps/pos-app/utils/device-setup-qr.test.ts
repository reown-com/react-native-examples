import { decodeDeviceSetupQr, encodeDeviceSetupQr } from "./device-setup-qr";

describe("device-setup-qr", () => {
  it("round-trips a payload", () => {
    const payload = { merchantId: "merchant_123", customerApiKey: "key_abc" };
    const decoded = decodeDeviceSetupQr(encodeDeviceSetupQr(payload));
    expect(decoded).toEqual(payload);
  });

  it("trims surrounding whitespace on decode", () => {
    const raw = JSON.stringify({
      v: 1,
      t: "wpay-keys",
      m: "  merchant_123  ",
      k: "  key_abc  ",
    });
    expect(decodeDeviceSetupQr(raw)).toEqual({
      merchantId: "merchant_123",
      customerApiKey: "key_abc",
    });
  });

  it("returns null for non-JSON input", () => {
    expect(decodeDeviceSetupQr("not a qr we made")).toBeNull();
    expect(decodeDeviceSetupQr("wc:1234@2?relay=...")).toBeNull();
  });

  it("returns null for JSON without our type tag", () => {
    expect(
      decodeDeviceSetupQr(JSON.stringify({ m: "merchant", k: "key" })),
    ).toBeNull();
  });

  it("returns null for an unsupported version", () => {
    expect(
      decodeDeviceSetupQr(
        JSON.stringify({ v: 99, t: "wpay-keys", m: "merchant", k: "key" }),
      ),
    ).toBeNull();
  });

  it("returns null when a field is missing or empty", () => {
    expect(
      decodeDeviceSetupQr(JSON.stringify({ v: 1, t: "wpay-keys", m: "x" })),
    ).toBeNull();
    expect(
      decodeDeviceSetupQr(
        JSON.stringify({ v: 1, t: "wpay-keys", m: "", k: "key" }),
      ),
    ).toBeNull();
  });
});
