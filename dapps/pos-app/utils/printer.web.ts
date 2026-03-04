export const requestBluetoothPermission = async () => {
  return false;
};

export const connectPrinter = async (): Promise<{
  connected: boolean;
  error?: string;
}> => {
  return { connected: false, error: "Printing is not supported on web" };
};

export const printReceipt = async () => {
  throw new Error("Printing is not supported on web");
};
