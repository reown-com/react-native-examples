import { useFonts } from "expo-font";

// Web has no native font embedding, so the family aliases the UI references
// ("KH Teka Medium" etc.) must be registered at runtime. The native build gets
// these from the embedded fonts instead; see use-app-fonts.ts.
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    "KH Teka": require("@/assets/fonts/KHTeka-Regular.otf"),
    "KH Teka Light": require("@/assets/fonts/KHTeka-Light.otf"),
    "KH Teka Medium": require("@/assets/fonts/KHTeka-Medium.otf"),
    "KH Teka Mono": require("@/assets/fonts/KHTekaMono-Regular.otf"),
  });
  return loaded;
}
