/**
 * Small UI icons loaded before the first screen renders, so rows don't draw
 * first and then shift when an icon arrives (most visible on web, where each
 * icon is a separate request). Keep this to icons shown on first paint of a
 * screen; large or rarely used images can still load lazily.
 */
export const PRELOAD_IMAGES = [
  // Settings rows
  require("@/assets/images/scan.png"),
  require("@/assets/images/terminal.png"),
  require("@/assets/images/device-mobile.png"),
  require("@/assets/images/sun.png"),
  require("@/assets/images/moon.png"),
  require("@/assets/images/caret-up-down.png"),
  require("@/assets/images/chevron-right.png"),
  require("@/assets/images/warning_circle.png"),
  // Transaction status icons (list rows and detail sheet)
  require("@/assets/images/check.png"),
  require("@/assets/images/check-bold.png"),
  require("@/assets/images/receipt-x.png"),
  require("@/assets/images/clock.png"),
  // Bottom sheets, keypad and toasts
  require("@/assets/images/close.png"),
  require("@/assets/images/backspace.png"),
];
