import { buildPaymentSuccessParams } from "@/utils/payment-success-params";
import { PaymentStatusResponse } from "@/utils/types";

describe("buildPaymentSuccessParams", () => {
  it("carries completed option amount details to the success route", () => {
    const payment: PaymentStatusResponse = {
      status: "succeeded",
      isFinal: true,
      pollInMs: 0,
      info: {
        optionAmount: {
          value: "10000",
          display: {
            assetSymbol: "USDC",
            decimals: 6,
            networkName: "Solana",
          },
        },
      },
    };

    expect(buildPaymentSuccessParams("15.00", "pay_123", payment)).toEqual({
      amount: "15.00",
      paymentId: "pay_123",
      tokenAmount: "10000",
      token: "USDC",
      tokenDecimals: "6",
      chainName: "Solana",
    });
  });

  it("preserves zero token decimals", () => {
    const payment: PaymentStatusResponse = {
      status: "succeeded",
      isFinal: true,
      pollInMs: 0,
      info: {
        optionAmount: {
          value: "15",
          display: { assetSymbol: "WBTC", decimals: 0 },
        },
      },
    };

    expect(buildPaymentSuccessParams("15.00", "pay_123", payment)).toEqual({
      amount: "15.00",
      paymentId: "pay_123",
      tokenAmount: "15",
      token: "WBTC",
      tokenDecimals: "0",
    });
  });

  it("omits an incomplete token amount while retaining the network", () => {
    const payment: PaymentStatusResponse = {
      status: "succeeded",
      isFinal: true,
      pollInMs: null,
      info: {
        optionAmount: {
          value: "15000000",
          display: { assetSymbol: "USDC", networkName: "Solana" },
        },
      },
    };

    expect(buildPaymentSuccessParams("15.00", "pay_123", payment)).toEqual({
      amount: "15.00",
      paymentId: "pay_123",
      chainName: "Solana",
    });
  });

  it("keeps the success route usable without token details", () => {
    expect(buildPaymentSuccessParams("15.00", "pay_123")).toEqual({
      amount: "15.00",
      paymentId: "pay_123",
    });
  });
});
