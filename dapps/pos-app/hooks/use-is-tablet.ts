import { Platform } from "react-native";
import { isTablet } from "react-native-device-info";

export function getIsTablet(
  platform: typeof Platform.OS = Platform.OS,
): boolean {
  return platform !== "web" && isTablet();
}

/**
 * Returns true for native tablets while keeping every web viewport in the
 * existing phone-sized POS presentation.
 */
export function useIsTablet(): boolean {
  return getIsTablet();
}
