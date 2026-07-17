import { PropsWithChildren } from 'react';

/**
 * Native passthrough. The desktop frame only exists on web
 * (see DesktopFrameWrapper.web.tsx); on iOS/Android the app renders full-screen.
 */
export function DesktopFrameWrapper({ children }: PropsWithChildren) {
  return <>{children}</>;
}
