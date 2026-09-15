import { Colors } from "@/constants/theme";
import { useSettingsStore } from "@/store/useSettingsStore";
import { ColorSchemeName, useColorScheme } from "react-native";

type ColorScheme = "light" | "dark";
type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

// Only the base palette ships today, so the theme is just Colors[theme].
// Wallet theme variants are disabled; to re-enable brand color overrides, read
// the active `variant` from the store in the hooks below and merge it here:
//   import { Variants } from "@/constants/variants";
//   return { ...Colors[theme], ...(Variants[variant] ?? Variants.default).colors[theme] };
// (a small cache keyed by `${variant}:${theme}` avoids re-merging every render.)
function getTheme(theme: ColorScheme) {
  return Colors[theme];
}

function resolveTheme(
  themeMode: string,
  systemScheme: ColorSchemeName,
): ColorScheme {
  if (themeMode === "system") {
    return systemScheme === "dark" ? "dark" : "light";
  }
  return themeMode as ColorScheme;
}

export function useThemeColor(colorName: ColorName) {
  const themeMode = useSettingsStore((state) => state.themeMode) ?? "light";
  // Reactive: re-renders when the OS theme changes while set to "system",
  // instead of calling the native Appearance API on every render.
  const systemScheme = useColorScheme();

  const theme = resolveTheme(themeMode, systemScheme);

  return getTheme(theme)[colorName];
}

export function useTheme(scheme?: ColorScheme) {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const systemScheme = useColorScheme();

  const theme = scheme ?? resolveTheme(themeMode || "light", systemScheme);

  return getTheme(theme);
}
