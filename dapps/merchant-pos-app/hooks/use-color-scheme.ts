import { useSettingsStore } from "@/store/useSettingsStore";
import { Appearance } from "react-native";

export const useColorScheme = (): "light" | "dark" => {
  const themeMode = useSettingsStore((state) => state.themeMode);
  if (themeMode === "system") {
    return Appearance.getColorScheme() === "light" ? "light" : "dark";
  }
  return themeMode === "light" ? "light" : "dark";
};
