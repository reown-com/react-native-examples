import { Platform, TextStyle } from "react-native";

// Inputs draw their own focus border, so drop the browser focus ring (it also
// gets clipped by scroll containers). RN's types don't include "none", but
// react-native-web passes it through.
export const webInputReset =
  Platform.OS === "web"
    ? ({ outlineStyle: "none" } as unknown as TextStyle)
    : undefined;
