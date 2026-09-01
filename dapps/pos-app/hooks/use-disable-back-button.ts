import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

/**
 * Custom hook to disable the Android hardware back button
 *
 * @param enabled - Whether the block is active (defaults to `true`).
 *
 * @example
 *
 * const MyComponent = () => {
 *   useDisableBackButton();
 *   // ... rest of component
 * };
 *  */
export function useDisableBackButton(enabled = true) {
  useEffect(() => {
    if (Platform.OS !== "android" || !enabled) {
      return;
    }

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Return true to prevent default back behavior
        return true;
      },
    );

    return () => backHandler.remove();
  }, [enabled]);
}
