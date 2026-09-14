import { isTestPaymentFailure } from "@/services/test-payment";

describe("isTestPaymentFailure", () => {
  it("fails only the 0.02 Test Mode amount", () => {
    expect(isTestPaymentFailure("0.02")).toBe(true);
  });

  it.each(["0.01", "1.00", "25.50"])("succeeds for %s", (amount) => {
    expect(isTestPaymentFailure(amount)).toBe(false);
  });
});
