import {
  isTestPaymentFailure,
  isTestPaymentId,
  simulateTestReceipt,
} from "@/services/test-payment";

describe("isTestPaymentFailure", () => {
  it("fails only the 0.02 Test Mode amount", () => {
    expect(isTestPaymentFailure("0.02")).toBe(true);
  });

  it.each(["0.01", "1.00", "25.50"])("succeeds for %s", (amount) => {
    expect(isTestPaymentFailure(amount)).toBe(false);
  });
});

describe("isTestPaymentId", () => {
  it("matches local Test Mode payment IDs", () => {
    expect(isTestPaymentId("test_1727180000000")).toBe(true);
  });

  it("does not match real payment IDs", () => {
    expect(isTestPaymentId("pay_123")).toBe(false);
  });
});

describe("simulateTestReceipt", () => {
  it("resolves after a short delay", async () => {
    jest.useFakeTimers();
    const promise = simulateTestReceipt();
    jest.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
    jest.useRealTimers();
  });
});
