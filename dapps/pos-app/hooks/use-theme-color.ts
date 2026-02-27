import { Colors } from "@/constants/theme";
import { Variants } from "@/constants/variants";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Appearance } from "react-native";

function resolveTheme(themeMode: string): "light" | "dark" {
  if (themeMode === "system") {
    return Appearance.getColorScheme() || "light";
  }
  return themeMode as "light" | "dark";
}

export function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const themeMode = useSettingsStore((state) => state.themeMode) ?? "light";
  const variant = useSettingsStore((state) => state.variant);
  const theme = resolveTheme(themeMode);
  const variantColors = Variants[variant].colors[theme];

  return variantColors[colorName] || Colors[theme][colorName];
}

export function useTheme(scheme?: "light" | "dark") {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const variant = useSettingsStore((state) => state.variant);

  const theme = scheme || resolveTheme(themeMode || "light");
  const variantColors = Variants[variant].colors[theme];

  const colors = {
    ...Colors[theme],
    ...variantColors,
  };

  return colors;
}
