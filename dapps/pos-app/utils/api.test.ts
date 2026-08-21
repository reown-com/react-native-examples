import { maskPathIds } from "./api";

describe("maskPathIds", () => {
  it("masks prefixed ids", () => {
    expect(
      maskPathIds("/payments/pay_57a2ecc101M0FRYW0FDAAQFQ7SEJT8S0CS/cancel"),
    ).toBe("/payments/:id/cancel");
  });

  it("masks ids in the middle of a path", () => {
    expect(
      maskPathIds("/merchant/payment/pay_57a2ecc101M0FRYW0FD/status"),
    ).toBe("/merchant/payment/:id/status");
  });

  it("masks UUIDs", () => {
    expect(maskPathIds("/orders/2f3d8c1a-1b2c-4d5e-8f90-abcdef123456")).toBe(
      "/orders/:id",
    );
  });

  it("masks long opaque tokens mixing letters and digits", () => {
    expect(maskPathIds("/session/aB3xK9mQ2wL7pR4t")).toBe("/session/:id");
  });

  it("leaves plain route names untouched", () => {
    expect(maskPathIds("/merchant/payment")).toBe("/merchant/payment");
    expect(maskPathIds("/start")).toBe("/start");
  });

  it("does not mask short or word-only segments", () => {
    expect(maskPathIds("/paymentmethods")).toBe("/paymentmethods");
    expect(maskPathIds("/v1/status")).toBe("/v1/status");
  });

  it("preserves leading slash and empty segments", () => {
    expect(maskPathIds("/")).toBe("/");
  });
});
