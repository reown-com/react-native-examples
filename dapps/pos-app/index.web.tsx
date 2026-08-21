import "@expo/metro-runtime";

import { App } from "expo-router/build/qualified-entry";
import { renderRootComponent } from "expo-router/build/renderRootComponent";

import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

import { DesktopFrameWrapper } from "@/components/desktop-frame-wrapper.web";

// Maestro (web) test-id bridge.
//
// Maestro web locates elements (`id:` selector) via a "resource-id" it derives
// from each DOM node with this precedence:
//   node.id || aria-label || name || title || htmlFor || data-testid
// react-native-web maps our `testID` to `data-testid` (the LAST fallback) and
// maps `accessibilityLabel` to `aria-label`. So any element that has BOTH a
// testID and an accessibilityLabel (e.g. the home actions and CTA buttons)
// resolves to the aria-label, and Maestro's `id: <testID>` never matches — even
// though the element is plainly visible.
//
// Mirroring data-testid -> the DOM `id` (which Maestro checks FIRST) makes every
// `id: <testID>` flow resolve to the testID regardless of any aria-label. We
// only set it when the element has no explicit id of its own, so intentional
// ids are preserved. Web-only; harmless in the browser (RNW styles via classes,
// not ids).
function installMaestroTestIdBridge() {
  const mirror = (el: Element) => {
    if (!el || !el.getAttribute) {
      return;
    }
    const tid = el.getAttribute("data-testid");
    if (tid && !el.id) {
      el.id = tid;
    }
  };
  const sync = (root: Document | Element) => {
    if ("getAttribute" in root) {
      mirror(root);
    }
    root.querySelectorAll("[data-testid]").forEach(mirror);
  };
  const start = () => {
    sync(document);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.target instanceof Element) {
          mirror(m.target);
        }
        m.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            sync(node);
          }
        });
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-testid"],
    });
  };
  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start);
  }
}

function WrappedApp() {
  return (
    <DesktopFrameWrapper>
      <App />
    </DesktopFrameWrapper>
  );
}

installMaestroTestIdBridge();

LoadSkiaWeb().then(() => {
  renderRootComponent(WrappedApp);
});
