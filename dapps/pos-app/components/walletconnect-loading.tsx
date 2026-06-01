import {
  Canvas,
  Group,
  Skia,
  Skottie,
  useClock,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { useDerivedValue } from "react-native-reanimated";

const LOADING = require("@/assets/lottie/Loading.json");

// The animation is authored on a 1080x1080 canvas.
const SOURCE_SIZE = 1080;

export function WalletConnectLoading({ size = 120 }: { size?: number }) {
  // Create the Skottie animation during render (not at module scope) so it
  // happens after LoadSkiaWeb() resolves on web (see index.web.tsx).
  const animation = useMemo(
    () => Skia.Skottie.Make(JSON.stringify(LOADING)),
    [],
  );

  const clock = useClock();

  const frame = useDerivedValue(() => {
    const fps = animation.fps();
    const totalFrames = animation.duration() * fps;
    return ((clock.value / 1000) * fps) % totalFrames;
  });

  const scale = size / SOURCE_SIZE;

  return (
    <Canvas style={{ width: size, height: size }}>
      <Group transform={[{ scale }]}>
        <Skottie animation={animation} frame={frame} />
      </Group>
    </Canvas>
  );
}
