import { Colors } from "@/constants/theme";
import { VariantName, Variants } from "@/constants/variants";
import { useSettingsStore } from "@/store/useSettingsStore";
import { ColorSchemeName, useColorScheme } from "react-native";

type ColorScheme = "light" | "dark";
type ThemeColors = (typeof Colors)["light"];
type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

const mergedThemeCache = new Map<string, ThemeColors>();

function getMergedTheme(variant: VariantName, theme: ColorScheme): ThemeColors {
  const cacheKey = `${variant}:${theme}`;
  let merged = mergedThemeCache.get(cacheKey);
  if (!merged) {
    merged = { ...Colors[theme], ...Variants[variant].colors[theme] };
    mergedThemeCache.set(cacheKey, merged);
  }
  return merged;
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
  const variant = useSettingsStore((state) => state.variant);
  // Reactive: re-renders when the OS theme changes while set to "system",
  // instead of calling the native Appearance API on every render.
  const systemScheme = useColorScheme();

  const theme = resolveTheme(themeMode, systemScheme);

  return getMergedTheme(variant, theme)[colorName];
}

export function useTheme(scheme?: ColorScheme) {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const variant = useSettingsStore((state) => state.variant);
  const systemScheme = useColorScheme();

  const theme = scheme ?? resolveTheme(themeMode || "light", systemScheme);

  return getMergedTheme(variant, theme);
}
