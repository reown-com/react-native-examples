// Fonts are embedded in the native app (see the expo-font plugin config in
// app.json — every family the UI references is registered there), so they're
// available immediately at startup with no runtime load. Skipping useFonts on
// native keeps font loading off the cold-start critical path. Web loads them at
// runtime instead; see use-app-fonts.web.ts.
export function useAppFonts(): boolean {
  return true;
}
