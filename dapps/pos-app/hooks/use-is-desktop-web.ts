import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { DesktopFrame } from "@/constants/desktop-frame";

/**
 * Hook that returns true when running on web with a desktop-sized viewport.
 * Returns false on native platforms or when viewport is below the breakpoint.
 */
export function useIsDesktopWeb(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (Platform.OS !== "web") return false;
    if (typeof window === "undefined") return false;
    return window.innerWidth >= DesktopFrame.BREAKPOINT;
  });

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsDesktop(window.innerWidth >= DesktopFrame.BREAKPOINT);
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isDesktop;
}
