import { PropsWithChildren, useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';

import SettingsStore from '@/store/SettingsStore';
import { DarkTheme, LightTheme } from '@/utils/ThemeUtil';
import { DesktopFrame } from '@/constants/DesktopFrame';

/**
 * "Framed-lite" desktop frame for web.
 *
 * On a wide desktop viewport (>= BREAKPOINT) the app is centered in a fixed,
 * phone-width surface with rounded corners and a drop shadow so it doesn't
 * stretch giant across the screen. Below the breakpoint (mobile web) it renders
 * full-bleed, unchanged.
 *
 * Unlike the pos-app frame this deliberately avoids `transform: scale()` and a
 * modal portal. On web the <Modal /> renders inline (coverScreen=false) so it
 * stays inside this frame and is clipped by `overflow: hidden`; <Toast /> still
 * renders as a fixed full-viewport overlay and is left untouched.
 */
const RESIZE_DEBOUNCE_MS = 150;

function useIsDesktopWeb(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.innerWidth >= DesktopFrame.BREAKPOINT,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsDesktop(window.innerWidth >= DesktopFrame.BREAKPOINT);
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return isDesktop;
}

export function DesktopFrameWrapper({ children }: PropsWithChildren) {
  const { themeMode } = useSnapshot(SettingsStore.state);
  const isDesktop = useIsDesktopWeb();

  if (!isDesktop) {
    return <>{children}</>;
  }

  const Theme = themeMode === 'dark' ? DarkTheme : LightTheme;
  const backgroundColor =
    themeMode === 'dark' ? DesktopFrame.BACKGROUND.dark : DesktopFrame.BACKGROUND.light;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: DesktopFrame.DEVICE_WIDTH,
          height: `min(${DesktopFrame.DEVICE_HEIGHT}px, calc(100vh - 32px))`,
          borderRadius: DesktopFrame.SCREEN_RADIUS,
          boxShadow: DesktopFrame.SHADOW,
          overflow: 'hidden',
          backgroundColor: Theme['bg-primary'],
        }}>
        {children}
      </div>
    </div>
  );
}
