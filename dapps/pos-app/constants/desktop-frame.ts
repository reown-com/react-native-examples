/**
 * Constants for the desktop web device frame.
 * Only used when viewing the app on desktop web browsers.
 */

export const DesktopFrame = {
  /** Minimum viewport width to show the device frame */
  BREAKPOINT: 1024,

  /** Width of the simulated device screen */
  DEVICE_WIDTH: 430,

  /** Height of the simulated device screen */
  DEVICE_HEIGHT: 932,

  /** Thickness of the device bezel */
  BEZEL_WIDTH: 8,

  /** Corner radius of the outer device bezel */
  BEZEL_RADIUS: 48,

  /** Corner radius of the inner screen area */
  SCREEN_RADIUS: 40,

  /** Background colors for the page behind the device */
  BACKGROUND: {
    light: "#F0F0F0",
    dark: "#0A0A0A",
  },

  /** Screen background colors */
  SCREEN_BACKGROUND: {
    light: "#FFFFFF",
    dark: "#202020",
  },

  /** Bezel color (dark in both themes for realistic device look) */
  BEZEL_COLOR: "#1A1A1A",

  /** Shadow for the device frame */
  SHADOW: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
} as const;
