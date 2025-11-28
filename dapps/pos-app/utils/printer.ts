import { useLogsStore } from "@/store/useLogsStore";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";
import {
  ReactNativePosPrinter,
  TextOptions,
} from "react-native-thermal-pos-printer";

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

export const printReceipt = async (
  txnId: string,
  amountUsd: number,
  tokenSymbol: string,
  networkName: string,
  date = new Date().toLocaleDateString("en-GB"),
  logoBase64: string,
) => {
  try {
    await ReactNativePosPrinter.initializePrinter(); // resets + UTF-8

    // Logo
    await ReactNativePosPrinter.printImage(logoBase64, {
      width: 340,
      align: "CENTER",
    });

    await ReactNativePosPrinter.newLine(1);
    await ReactNativePosPrinter.printText("--------------------------------\n");

    await ReactNativePosPrinter.newLine(1);

    const normal = { size: 10 } as TextOptions;
    const normalCenter = { size: 10, align: "CENTER" } as TextOptions;
    const bold = { size: 10, bold: true } as TextOptions;

    await ReactNativePosPrinter.printText("ID        ", normal);
    await ReactNativePosPrinter.printText(`${txnId}\n`, bold);

    await ReactNativePosPrinter.printText("DATE      ", normal);
    await ReactNativePosPrinter.printText(`${date}\n`, bold);

    await ReactNativePosPrinter.printText("METHOD    ", normal);
    await ReactNativePosPrinter.printText("WalletConnect Pay\n", bold);

    await ReactNativePosPrinter.printText("AMOUNT    ", normal);
    await ReactNativePosPrinter.printText(`$${amountUsd.toFixed(2)}\n`, bold);

    await ReactNativePosPrinter.printText("PAID WITH ", normal);
    await ReactNativePosPrinter.printText(
      `${tokenSymbol} ${amountUsd.toFixed(2)}\n`,
      bold,
    );

    await ReactNativePosPrinter.printText("NETWORK   ", normal);
    await ReactNativePosPrinter.printText(`${networkName}\n`, bold);

    await ReactNativePosPrinter.newLine(1);
    await ReactNativePosPrinter.printText("--------------------------------\n");

    await ReactNativePosPrinter.newLine(2);

    await ReactNativePosPrinter.printText(
      "Thank you for your purchase!\n",
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
