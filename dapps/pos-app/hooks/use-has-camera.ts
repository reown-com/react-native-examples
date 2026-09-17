import { CameraView } from "expo-camera";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { isCameraPresent } from "react-native-device-info";

// Reports whether the device has a usable camera, so the API-key scan
// affordance can be hidden on camera-less hardware (e.g. some POS terminals).
//
// Detection is per-platform because no single API covers all three:
// - web: CameraView.isAvailableAsync() enumerates `videoinput` devices.
// - android: react-native-device-info's isCameraPresent() (the case that
//   matters for camera-less POS terminals).
// - ios: neither API supports iOS, but every iOS device this app runs on has a
//   camera, so we assume present.
//
// Defaults to `true` (optimistic) and only flips to `false` once a check
// confirms no camera, so the icon doesn't flash out on the common case. Any
// detection error fails open (keeps the icon; the scan screen still handles the
// permission/unavailable states).
export function useHasCamera(): boolean {
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        if (Platform.OS === "web") {
          const available = await CameraView.isAvailableAsync();
          if (mounted) setHasCamera(available);
        } else if (Platform.OS === "android") {
          const present = await isCameraPresent();
          if (mounted) setHasCamera(present);
        }
        // iOS: leave the optimistic default.
      } catch {
        // Fail open — keep the affordance visible.
      }
    }

    check();

    return () => {
      mounted = false;
    };
  }, []);

  return hasCamera;
}
