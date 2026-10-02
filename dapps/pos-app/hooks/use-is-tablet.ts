import { useMemo } from "react";
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
 *
 * The classification is a stable device constant, so it is memoised to make
 * the "this never changes" contract explicit and to query device info only
 * once per component mount.
 */
export function useIsTablet(): boolean {
  return useMemo(() => getIsTablet(), []);
}
