import { getUniqueId } from "react-native-device-info";

export const getDeviceIdentifier = async () => {
  try {
    const deviceId = await getUniqueId();
    return deviceId.toString();
  } catch {
    return "unknown";
  }
};

export const isVariant = () => {
  return process.env.EXPO_PUBLIC_VARIANT === "polygon" || false;
};
