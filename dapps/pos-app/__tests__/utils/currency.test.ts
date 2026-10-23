import { formatTokenAmount as payCoreFormatTokenAmount } from "@walletconnect/pay-core";

import { formatTokenAmount } from "@/utils/currency";

describe("formatTokenAmount", () => {
  it.each([
    ["1000000", 6, "1.00"],
    ["1500000", 6, "1.50"],
    ["1234567", 6, "1.234567"],
    ["4560", 6, "0.00456"],
    ["1", 6, "0.000001"],
    ["1234567891", 9, "≈1.234567"],
    ["1", 18, "<0.000001"],
    ["0", 6, "0.00"],
    ["42", 0, "42"],
    ["1.5", 6, "1.5"],
  ])("formats %s with %i decimals as %s", (value, decimals, expected) => {
    expect(formatTokenAmount(value, decimals)).toBe(expected);
  });

  it.each([
    ["1000000", 6],
    ["1234567", 6],
    ["4560", 6],
    ["1", 6],
    ["1234567891", 9],
    ["1", 18],
    ["1500000000000000000", 18],
    ["0", 6],
    ["42", 0],
    ["abc", 6],
  ])("matches pay-core for %s with %i decimals", (value, decimals) => {
    expect(formatTokenAmount(value, decimals)).toBe(
      payCoreFormatTokenAmount(value, decimals),
    );
  });

  // Hermes doesn't implement formatToParts on iOS: calling it crashes the app.
  it("does not use Intl.NumberFormat#formatToParts", () => {
    const formatToParts = jest
      .spyOn(Intl.NumberFormat.prototype, "formatToParts")
      .mockImplementation(() => {
        throw new Error("formatToParts is unimplemented on Apple platforms");
      });

    try {
      // Load a fresh copy so no separator is cached from the tests above.
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const currency: typeof import("@/utils/currency") = require("@/utils/currency");
        expect(currency.formatTokenAmount("1500000", 6)).toBe("1.50");
      });
      expect(formatToParts).not.toHaveBeenCalled();
    } finally {
      formatToParts.mockRestore();
    }
  });
});
