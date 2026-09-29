import { ReactNativePosPrinter } from "react-native-thermal-pos-printer";
import { getCurrency } from "@/utils/currency";
import { printReceipt } from "@/utils/printer";

// The real module needs a native TurboModule, so the suite can't load without this.
jest.mock("react-native-permissions", () => ({
  PERMISSIONS: { ANDROID: { BLUETOOTH_CONNECT: "bluetooth_connect" } },
  RESULTS: { GRANTED: "granted", LIMITED: "limited" },
  request: jest.fn(() => Promise.resolve("granted")),
}));

describe("printReceipt", () => {
  const printer = ReactNativePosPrinter as jest.Mocked<
    typeof ReactNativePosPrinter
  >;

  it("prints the formatted crypto amount and network", async () => {
    await printReceipt({
      txnId: "pay_c7a2ecc101M25JR3JAZ437PMNED75QJZVG",
      amountFiat: 15,
      currency: getCurrency("USD"),
      tokenAmount: "15000000",
      tokenSymbol: "USDC",
      tokenDecimals: 6,
      networkName: "Base",
      date: "10/09/2026",
    });

    expect(printer.printText).toHaveBeenCalledWith(
      "pay_c7a2...QJZVG\n",
      expect.any(Object),
    );
    expect(printer.printText).toHaveBeenCalledWith(
      "PAID WITH ",
      expect.any(Object),
    );
    expect(printer.printText).toHaveBeenCalledWith(
      "15.00 USDC\n",
      expect.any(Object),
    );
    expect(printer.printText).toHaveBeenCalledWith(
      "NETWORK   ",
      expect.any(Object),
    );
    expect(printer.printText).toHaveBeenCalledWith(
      "Base\n",
      expect.any(Object),
    );
  });

  it("does not print raw token base units without decimals", async () => {
    await printReceipt({
      txnId: "pay_123",
      amountFiat: 15,
      currency: getCurrency("USD"),
      tokenAmount: "15000000",
      tokenSymbol: "USDC",
      date: "10/09/2026",
    });

    expect(printer.printText).toHaveBeenCalledWith(
      "$15.00\n",
      expect.any(Object),
    );
    expect(printer.printText).not.toHaveBeenCalledWith(
      "PAID WITH ",
      expect.any(Object),
    );
    expect(printer.printText).not.toHaveBeenCalledWith(
      "NETWORK   ",
      expect.any(Object),
    );
  });

  // The receipt must show the same amount as the payment page and the email,
  // and must never print a rounded amount as if it were exact.
  it.each([
    [
      "an exact small amount without rounding",
      "4560",
      6,
      "USDC",
      "0.00456 USDC",
    ],
    ["a cut amount with ≈", "412345678901234567", 18, "ETH", "≈0.412345 ETH"],
    ["dust instead of zero", "123", 18, "ETH", "<0.000001 ETH"],
  ])("prints %s", async (_, tokenAmount, tokenDecimals, tokenSymbol, line) => {
    await printReceipt({
      txnId: "pay_123",
      amountFiat: 15,
      currency: getCurrency("USD"),
      tokenAmount,
      tokenSymbol,
      tokenDecimals,
      date: "10/09/2026",
    });

    expect(printer.printText).toHaveBeenCalledWith(
      `${line}\n`,
      expect.any(Object),
    );
  });
});
