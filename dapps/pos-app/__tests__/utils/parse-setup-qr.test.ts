import { parseSetupQr, toSetupPayload } from "@/utils/parse-setup-qr";

// Mirrors how the merchant dashboard builds the QR payload.
const dashboardLink = (apiKey: string, merchantId: string) =>
  `wpay://setup?${new URLSearchParams({ apiKey, merchantId })}`;

describe("parseSetupQr", () => {
  it("reads the merchant ID and API key from the dashboard deep link", () => {
    expect(parseSetupQr(dashboardLink("sk_live_abc123", "merchant-1"))).toEqual(
      { apiKey: "sk_live_abc123", merchantId: "merchant-1" },
    );
  });

  it("decodes URL-encoded values, including + and =", () => {
    expect(
      parseSetupQr(dashboardLink("a+b/c=d==", "merchant with space")),
    ).toEqual({ apiKey: "a+b/c=d==", merchantId: "merchant with space" });
  });

  it("accepts variant schemes and surrounding whitespace", () => {
    expect(
      parseSetupQr("  wpay-internal://setup?merchantId=m1&apiKey=k1\n"),
    ).toEqual({ apiKey: "k1", merchantId: "m1" });
    expect(parseSetupQr("WPAY://setup/?apiKey=k1&merchantId=m1")).toEqual({
      apiKey: "k1",
      merchantId: "m1",
    });
  });

  it("ignores unknown params the dashboard may add later", () => {
    expect(
      parseSetupQr("wpay://setup?env=live&apiKey=k1&merchantId=m1"),
    ).toEqual({ apiKey: "k1", merchantId: "m1" });
  });

  it("rejects links missing either value", () => {
    expect(parseSetupQr("wpay://setup?apiKey=k1")).toBeNull();
    expect(parseSetupQr("wpay://setup?merchantId=m1")).toBeNull();
    expect(parseSetupQr("wpay://setup?apiKey=&merchantId=m1")).toBeNull();
    expect(parseSetupQr("wpay://setup")).toBeNull();
  });

  it("rejects anything that isn't a wpay setup link", () => {
    expect(parseSetupQr("sk_live_abc123")).toBeNull();
    expect(parseSetupQr('{"apiKey":"k1","merchantId":"m1"}')).toBeNull();
    expect(parseSetupQr("wpay://pay?apiKey=k1&merchantId=m1")).toBeNull();
    expect(
      parseSetupQr("https://example.com/setup?apiKey=k1&merchantId=m1"),
    ).toBeNull();
    expect(
      parseSetupQr("otherwpay://setup?apiKey=k1&merchantId=m1"),
    ).toBeNull();
  });
});

describe("toSetupPayload", () => {
  it("trims values and requires both", () => {
    expect(toSetupPayload(" k1 ", " m1 ")).toEqual({
      apiKey: "k1",
      merchantId: "m1",
    });
    expect(toSetupPayload("k1", undefined)).toBeNull();
    expect(toSetupPayload(["k1", "k2"], "m1")).toBeNull();
    expect(toSetupPayload("  ", "m1")).toBeNull();
  });
});
