import { Colors } from "@/constants/theme";
import { Variants } from "@/constants/variants";
import { useSettingsStore } from "@/store/useSettingsStore";

export function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useSettingsStore((state) => state.themeMode) ?? "light";
  const variant = useSettingsStore((state) => state.variant);
  const variantColors = Variants[variant].colors[theme];

  return variantColors[colorName] || Colors[theme][colorName];
}

export function useTheme(scheme?: "light" | "dark") {
  const systemScheme = useSettingsStore((state) => state.themeMode);
  const variant = useSettingsStore((state) => state.variant);

  const theme = scheme || systemScheme || "light";
  const variantColors = Variants[variant].colors[theme];

  const colors = {
    ...Colors[theme],
    ...variantColors,
  };

  return colors;
}
