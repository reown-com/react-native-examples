import "@expo/metro-runtime";

import { App } from "expo-router/build/qualified-entry";
import { renderRootComponent } from "expo-router/build/renderRootComponent";

import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

import { DesktopFrameWrapper } from "@/components/desktop-frame-wrapper.web";

function WrappedApp() {
  return (
    <DesktopFrameWrapper>
      <App />
    </DesktopFrameWrapper>
  );
}

LoadSkiaWeb().then(() => {
  renderRootComponent(WrappedApp);
});
