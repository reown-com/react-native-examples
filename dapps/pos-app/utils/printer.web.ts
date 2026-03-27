import { Currency } from "./currency";

export const requestBluetoothPermission = async () => {
  return true;
};

export const connectPrinter = async (): Promise<{
  connected: boolean;
  error?: string;
}> => {
  return { connected: false, error: "Printing is not supported on web" };
};

interface PrintReceiptProps {
  txnId: string;
  amountFiat: number;
  currency: Currency;
  tokenSymbol?: string;
  tokenAmount?: string;
  tokenDecimals?: number;
  networkName?: string;
  date?: string;
  logoBase64?: string;
}

export const printReceipt = async (
  _props: PrintReceiptProps,
): Promise<void> => {
  throw new Error("Printing is not supported on web");
};
