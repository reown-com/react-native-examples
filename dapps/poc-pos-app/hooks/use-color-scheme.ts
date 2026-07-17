import { useSettingsStore } from "@/store/useSettingsStore";

export const useColorScheme = () => {
  const systemScheme = useSettingsStore((state) => state.themeMode);
  return systemScheme || "light";
};
