import { Platform } from "react-native";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";

// Kept in its own module (separate from utils/printer) so requesting the
// permission at startup doesn't eagerly evaluate the thermal-printer
// implementation. See utils/printer.ts for the actual print flow.
export const requestBluetoothPermission = async () => {
  // BLUETOOTH_CONNECT is an Android 12+ runtime permission. On iOS/web there is
  // no such handler, so requesting it throws. Only ask for it on Android.
  if (Platform.OS !== "android") return true;
  const result = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
  return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
};
