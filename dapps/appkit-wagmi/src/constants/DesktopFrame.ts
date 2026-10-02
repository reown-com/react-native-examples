// Shared dimensions for the "framed-lite" desktop-web layout.
// Used by DesktopFrameWrapper.web.tsx (the frame) to constrain the app to a
// phone-like surface on wide desktop viewports.
export const DesktopFrame = {
  // Min viewport width at which the desktop frame is shown
  BREAKPOINT: 1024,
  // Phone-like surface width the app is constrained to
  DEVICE_WIDTH: 430,
  DEVICE_HEIGHT: 932,
  SCREEN_RADIUS: 40,
  SHADOW: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  // Neutral page background behind the frame (distinct from the screen bg for contrast)
  BACKGROUND: {
    light: '#F0F0F0',
    dark: '#0A0A0A',
  },
} as const;
