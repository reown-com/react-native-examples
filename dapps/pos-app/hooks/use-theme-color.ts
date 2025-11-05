import { Colors } from "@/constants/theme";
import { useSettingsStore } from "@/store/useSettingsStore";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useSettingsStore((state) => state.themeMode) ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function useTheme(scheme?: "light" | "dark") {
  const systemScheme = useSettingsStore((state) => state.themeMode);
  const theme = scheme || systemScheme || "light";
  return Colors[theme];
}
