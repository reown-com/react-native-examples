import { getUniqueId } from "react-native-device-info";

export const getDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDeviceIdentifier = async () => {
  try {
    const deviceId = await getUniqueId();
    return deviceId.toString();
  } catch {
    return "unknown";
  }
};
