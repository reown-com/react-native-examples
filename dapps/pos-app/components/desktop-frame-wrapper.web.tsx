import React, { useEffect, useState } from "react";

import { DesktopFrame } from "@/constants/desktop-frame";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useIsDesktopWeb } from "@/hooks/use-is-desktop-web";

interface DesktopFrameWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in a POS device frame when viewed on desktop web.
 * On mobile web or native platforms, renders children unchanged.
 */
export function DesktopFrameWrapper({ children }: DesktopFrameWrapperProps) {
  const isDesktop = useIsDesktopWeb();
  const colorScheme = useColorScheme();
  const [scale, setScale] = useState(1);

  const totalWidth = DesktopFrame.DEVICE_WIDTH + DesktopFrame.BEZEL_WIDTH * 2;
  const totalHeight = DesktopFrame.DEVICE_HEIGHT + DesktopFrame.BEZEL_WIDTH * 2;
  const labelHeight = 50; // Approximate height for label + margin

  useEffect(() => {
    if (typeof window === "undefined") return;

    const calculateScale = () => {
      const availableHeight = window.innerHeight - labelHeight;
      const newScale = Math.min(1, availableHeight / totalHeight);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [totalHeight]);

  if (!isDesktop) {
    return <>{children}</>;
  }

  const backgroundColor =
    colorScheme === "dark"
      ? DesktopFrame.BACKGROUND.dark
      : DesktopFrame.BACKGROUND.light;

  const screenBackground =
    colorScheme === "dark"
      ? DesktopFrame.SCREEN_BACKGROUND.dark
      : DesktopFrame.SCREEN_BACKGROUND.light;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Device frame */}
      <div
        style={{
          width: totalWidth,
          height: totalHeight,
          backgroundColor: DesktopFrame.BEZEL_COLOR,
          borderRadius: DesktopFrame.BEZEL_RADIUS,
          boxShadow: DesktopFrame.SHADOW,
          padding: DesktopFrame.BEZEL_WIDTH,
          boxSizing: "border-box",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Screen area */}
        <div
          style={{
            width: DesktopFrame.DEVICE_WIDTH,
            height: DesktopFrame.DEVICE_HEIGHT,
            borderRadius: DesktopFrame.SCREEN_RADIUS,
            overflow: "hidden",
            backgroundColor: screenBackground,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          marginTop: 16,
          fontSize: 14,
          color: colorScheme === "dark" ? "#666666" : "#999999",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        POS Terminal Demo
      </div>
    </div>
  );
}
