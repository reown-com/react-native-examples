import { Canvas, Group, Skia, Skottie } from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

const SUCCESS = require("@/assets/lottie/Success.json");

// The animation is authored on a 1080x1080 canvas.
const SOURCE_SIZE = 1080;

export function SuccessAnimation({
  width = 120,
  height = 95,
}: {
  width?: number;
  height?: number;
}) {
  // Create the Skottie animation during render (not at module scope) so it
  // happens after LoadSkiaWeb() resolves on web (see index.web.tsx).
  const animation = useMemo(
    () => Skia.Skottie.Make(JSON.stringify(SUCCESS)),
    [],
  );

  // Read the (constant) frame rate / length on the JS thread so the worklet
  // below only does arithmetic — no per-frame JSI calls into the Skottie
  // object. Safe defaults keep the worklet valid if the animation failed to
  // load (Skia.Skottie.Make can return null).
  const fps = animation?.fps() ?? 60;
  const totalFrames = (animation?.duration() ?? 1) * fps;

  // Drive the animation with a controllable clock instead of Skia's useClock(),
  // which ticks every frame for as long as the component is mounted with no way
  // to pause. We accumulate elapsed time (rather than reading an absolute
  // clock) so pausing and resuming is seamless: while the callback is inactive
  // no frames fire, so `frame` stops changing, the Skottie holds its last frame
  // and Skia stops redrawing. Starts inactive; the effect below activates it.
  const elapsedMs = useSharedValue(0);
  const frameCallback = useFrameCallback((info) => {
    "worklet";
    elapsedMs.value += info.timeSincePreviousFrame ?? 0;
  }, false);

  // One-shot: play once and hold on the final frame. Once elapsed time passes
  // the animation duration, `frame` stays pinned at the last frame so Skia
  // stops repainting — no loop.
  const frame = useDerivedValue(() =>
    Math.min((elapsedMs.value / 1000) * fps, totalFrames - 1),
  );

  // Pause the clock while the app is backgrounded (the animation is mounted but
  // not visible) so it doesn't keep burning CPU/GPU on the UI thread. Resumes
  // automatically when the app returns to the foreground.
  useEffect(() => {
    const syncActive = (state: AppStateStatus = AppState.currentState) =>
      frameCallback.setActive(!!animation && state === "active");
    syncActive();
    const subscription = AppState.addEventListener("change", syncActive);
    return () => {
      subscription.remove();
      frameCallback.setActive(false);
    };
  }, [frameCallback, animation]);

  // Scale the square source artwork uniformly (contain) into the target box so
  // it is never squashed, then center it within the canvas.
  const scale = Math.min(width, height) / SOURCE_SIZE;
  const scaledSize = SOURCE_SIZE * scale;
  const translateX = (width - scaledSize) / 2;
  const translateY = (height - scaledSize) / 2;

  if (!animation) {
    return null;
  }

  return (
    <Canvas style={{ width, height }}>
      <Group transform={[{ translateX }, { translateY }, { scale }]}>
        <Skottie animation={animation} frame={frame} />
      </Group>
    </Canvas>
  );
}
