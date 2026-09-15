import { ReactNativePosPrinter } from "react-native-thermal-pos-printer";
import { getCurrency } from "@/utils/currency";
import { printReceipt } from "@/utils/printer";

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

  it("rounds a small token amount to four decimals", async () => {
    await printReceipt({
      txnId: "pay_123",
      amountFiat: 15,
      currency: getCurrency("USD"),
      tokenAmount: "4560",
      tokenSymbol: "USDC",
      tokenDecimals: 6,
      date: "10/09/2026",
    });

    expect(printer.printText).toHaveBeenCalledWith(
      "0.0046 USDC\n",
      expect.any(Object),
    );
  });
});
