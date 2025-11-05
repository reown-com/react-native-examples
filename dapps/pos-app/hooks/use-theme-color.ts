import { Colors } from "@/constants/theme";
import { useSettingsStore } from "@/store/useSettingsStore";

export function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useSettingsStore((state) => state.themeMode) ?? "light";

  return Colors[theme][colorName];
}

export function useTheme(scheme?: "light" | "dark") {
  const systemScheme = useSettingsStore((state) => state.themeMode);
  const theme = scheme || systemScheme || "light";
  return Colors[theme];
}
