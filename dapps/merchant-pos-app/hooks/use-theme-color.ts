import { ColorName, Colors } from "@/constants/theme";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Appearance } from "react-native";

function resolveTheme(themeMode: string): "light" | "dark" {
  if (themeMode === "system") {
    return Appearance.getColorScheme() === "light" ? "light" : "dark";
  }
  return themeMode === "light" ? "light" : "dark";
}

export function useThemeColor(colorName: ColorName) {
  const themeMode = useSettingsStore((state) => state.themeMode) ?? "dark";
  const theme = resolveTheme(themeMode);
  return Colors[theme][colorName];
}

export function useTheme(scheme?: "light" | "dark") {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const theme = scheme || resolveTheme(themeMode || "dark");
  return Colors[theme];
}
