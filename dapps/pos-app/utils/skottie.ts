import { Skia, type SkSkottieAnimation } from "@shopify/react-native-skia";
import { Platform } from "react-native";

/**
 * Build a Skottie animation from a Lottie JSON source, or `null` when Skia
 * can't create one yet.
 *
 * On web, Skia is backed by CanvasKit, which `LoadSkiaWeb()` loads in the
 * browser before the app renders (see index.web.tsx). `expo export -p web`
 * also pre-renders every route in Node for the static output, where CanvasKit
 * is never loaded and `Skia.Skottie.Make` throws. Returning `null` there lets
 * the static HTML render without the animation; the client renders it once
 * CanvasKit is ready.
 */
export function makeSkottieAnimation(
  source: object,
): SkSkottieAnimation | null {
  if (
    Platform.OS === "web" &&
    typeof (globalThis as { CanvasKit?: unknown }).CanvasKit === "undefined"
  ) {
    return null;
  }
  return Skia.Skottie.Make(JSON.stringify(source));
}
