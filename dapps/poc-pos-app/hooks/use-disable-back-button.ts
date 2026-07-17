import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

/**
 * Custom hook to disable the Android hardware back button
 *
 * @example
 *
 * const MyComponent = () => {
 *   useDisableBackButton();
 *   // ... rest of component
 * };
 *  */
export function useDisableBackButton() {
  useEffect(() => {
    if (Platform.OS !== "android") {
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
  }, []);
}
