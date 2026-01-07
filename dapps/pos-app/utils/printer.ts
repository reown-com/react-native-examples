import { DEFAULT_LOGO_BASE64 } from "@/constants/printer-logos";
import { useLogsStore } from "@/store/useLogsStore";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";
import {
  ReactNativePosPrinter,
  TextOptions,
} from "react-native-thermal-pos-printer";
import { getDate } from "./misc";

export const requestBluetoothPermission = async () => {
  const result = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
  return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
};

export const connectPrinter = async (): Promise<{
  connected: boolean;
  error?: string;
}> => {
  try {
    // Scan for devices
    const devices = await ReactNativePosPrinter.getDeviceList();
    if (devices.length === 0) {
      return {
        connected: false,
        error: "No printer detected on this device",
      };
    }

    // Connect to first device
    const printer = devices[0].getDevice(); // { name, address, vendorId, productId, ... }
    await ReactNativePosPrinter.connectPrinter(printer.address); // e.g., 'USB' or mac address
    useLogsStore
      .getState()
      .addLog("info", "Printer connected", "printer", "connectPrinter", {
        printer,
      });
    return { connected: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    useLogsStore
      .getState()
      .addLog("error", errorMessage, "printer", "connectPrinter", { error });

    // Check for Bluetooth permission error
    if (
      errorMessage.includes("BLUETOOTH_CONNECT") ||
      errorMessage.includes("bluetooth") ||
      errorMessage.includes("permission")
    ) {
      return {
        connected: false,
        error:
          "Please enable Bluetooth on your device to connect to the printer",
      };
    }

    // Generic error with details
    return {
      connected: false,
      error: `Failed to connect: ${errorMessage}`,
    };
  }
};

/**
 * Formats a raw token amount (in smallest units) to a human-readable string
 * @param rawAmount - Token amount in smallest unit (e.g., "100000" for 0.0001 SOL)
 * @param decimals - Token decimals (e.g., 9 for SOL, 6 for USDC)
 * @returns Formatted amount string (e.g., "0.0001")
 */
const formatTokenAmount = (rawAmount: string, decimals: number): string => {
  if (!rawAmount || decimals === 0) return rawAmount;

  const padded = rawAmount.padStart(decimals + 1, "0");
  const integerPart = padded.slice(0, -decimals) || "0";
  const decimalPart = padded.slice(-decimals);

  // Trim trailing zeros but keep at least 2 decimal places for readability
  const trimmedDecimal = decimalPart.replace(/0+$/, "").padEnd(2, "0");

  return `${integerPart}.${trimmedDecimal}`;
};

interface PrintReceiptProps {
  txnId: string;
  amountUsd: number;
  tokenSymbol?: string;
  tokenAmount?: string;
  tokenDecimals?: number;
  networkName?: string;
  date?: string;
  logoBase64?: string;
}

export const printReceipt = async ({
  txnId,
  amountUsd,
  tokenSymbol,
  tokenAmount,
  tokenDecimals,
  networkName,
  date = getDate(),
  logoBase64 = DEFAULT_LOGO_BASE64,
}: PrintReceiptProps) => {
  try {
    await ReactNativePosPrinter.initializePrinter(); // resets + UTF-8

    // Logo
    await ReactNativePosPrinter.printImage(logoBase64, {
      align: "CENTER",
    });

    await ReactNativePosPrinter.newLine(1);
    await ReactNativePosPrinter.printText("--------------------------------\n");

    await ReactNativePosPrinter.newLine(1);

    const normal = { size: 10 } as TextOptions;
    const normalCenter = { size: 10, align: "CENTER" } as TextOptions;
    const bold = { size: 10, bold: true } as TextOptions;
    const idStyle = { size: 9, bold: true } as TextOptions;

    await ReactNativePosPrinter.printText("ID        ", normal);
    await ReactNativePosPrinter.printText(`${txnId}\n`, idStyle);

    await ReactNativePosPrinter.printText("DATE      ", normal);
    await ReactNativePosPrinter.printText(`${date}\n`, bold);

    await ReactNativePosPrinter.printText("METHOD    ", normal);
    await ReactNativePosPrinter.printText("WalletConnect Pay\n", bold);

    if (amountUsd) {
      await ReactNativePosPrinter.printText("AMOUNT    ", normal);
      await ReactNativePosPrinter.printText(`$${amountUsd.toFixed(2)}\n`, bold);
    }

    if (tokenSymbol && tokenAmount && tokenDecimals) {
      await ReactNativePosPrinter.printText("PAID WITH ", normal);
      await ReactNativePosPrinter.printText(
        `${tokenSymbol} ${formatTokenAmount(tokenAmount, tokenDecimals)}\n`,
        bold,
      );
    }

    if (networkName) {
      await ReactNativePosPrinter.printText("NETWORK   ", normal);
      await ReactNativePosPrinter.printText(`${networkName}\n`, bold);
    }

    await ReactNativePosPrinter.newLine(1);
    await ReactNativePosPrinter.printText("--------------------------------\n");

    await ReactNativePosPrinter.newLine(2);

    await ReactNativePosPrinter.printText(
      "Thank you for your payment!\n",
      normalCenter,
    );

    await ReactNativePosPrinter.newLine(2);
    await ReactNativePosPrinter.cutPaper();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    useLogsStore
      .getState()
      .addLog("error", errorMessage, "printer", "printReceipt");
  }
};
