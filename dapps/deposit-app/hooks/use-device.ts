import { Platform, useWindowDimensions } from 'react-native';

import { DESKTOP_BREAKPOINT } from '@/constants/theme';

export type Device = 'desktop' | 'mobile';

/**
 * Resolves the layout to render. The prototype used a manual Desktop/Mobile
 * toggle for side-by-side demoing; per the spec, the production app detects the
 * viewport instead: a wide web window renders the desktop layout (sidebar +
 * centered modal), everything else (native, narrow web) renders the mobile
 * layout (bottom nav + bottom sheet).
 */
export function useDevice(): Device {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;
  return isDesktop ? 'desktop' : 'mobile';
}
