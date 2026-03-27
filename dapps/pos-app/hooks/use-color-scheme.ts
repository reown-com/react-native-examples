import { useSettingsStore } from "@/store/useSettingsStore";
import { Appearance } from "react-native";

export const useColorScheme = () => {
  const themeMode = useSettingsStore((state) => state.themeMode);
  if (themeMode === "system") {
    // NOTE: Appearance.getColorScheme() is a one-time read, not reactive.
    // The app won't auto-update when the OS theme changes while set to "system".
    // To make it reactive, use RN's useColorScheme() hook or Appearance.addEventListener.
    return Appearance.getColorScheme() || "light";
  }
  return themeMode || "light";
};
