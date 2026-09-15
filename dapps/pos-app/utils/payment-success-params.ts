import { PaymentStatusResponse } from "./types";

export interface PaymentSuccessParams {
  // Index signature keeps this assignable to Expo Router's `UnknownInputParams`
  // when passed to `router.replace({ params })`.
  [key: string]: string | undefined;
  amount: string;
  paymentId: string;
  tokenAmount?: string;
  token?: string;
  tokenDecimals?: string;
  chainName?: string;
}

export function buildPaymentSuccessParams(
  amount: string,
  paymentId: string,
  payment?: PaymentStatusResponse,
): PaymentSuccessParams {
  const tokenAmount = payment?.info?.optionAmount ?? payment?.tokenAmount;
  const tokenDisplay = tokenAmount?.display;
  const tokenValue = tokenAmount?.value;
  const tokenSymbol = tokenDisplay?.assetSymbol;
  const tokenDecimals = tokenDisplay?.decimals;
  const hasDisplayableToken =
    !!tokenValue && !!tokenSymbol && tokenDecimals != null;

  return {
    amount,
    paymentId,
    ...(hasDisplayableToken && {
      tokenAmount: tokenValue,
      token: tokenSymbol,
      tokenDecimals: String(tokenDecimals),
    }),
    ...(tokenDisplay?.networkName && { chainName: tokenDisplay.networkName }),
  };
}
