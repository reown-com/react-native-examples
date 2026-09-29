import { BorderRadius } from "@/constants/spacing";
import { StyleSheet, View, ViewStyle } from "react-native";

const LENGTH = 44;
const THICKNESS = 4;
const RADIUS = BorderRadius["3"];

// Each corner is an L drawn with two borders of a square View.
const CORNERS: ViewStyle[] = [
  {
    top: 0,
    left: 0,
    borderTopWidth: THICKNESS,
    borderLeftWidth: THICKNESS,
    borderTopLeftRadius: RADIUS,
  },
  {
    top: 0,
    right: 0,
    borderTopWidth: THICKNESS,
    borderRightWidth: THICKNESS,
    borderTopRightRadius: RADIUS,
  },
  {
    bottom: 0,
    left: 0,
    borderBottomWidth: THICKNESS,
    borderLeftWidth: THICKNESS,
    borderBottomLeftRadius: RADIUS,
  },
  {
    bottom: 0,
    right: 0,
    borderBottomWidth: THICKNESS,
    borderRightWidth: THICKNESS,
    borderBottomRightRadius: RADIUS,
  },
];

// Viewfinder corner brackets for the QR scanner, built from plain Views since
// pos-app has no react-native-svg.
export function ScanCorners({ size, color }: { size: number; color: string }) {
  return (
    <View style={{ width: size, height: size }}>
      {CORNERS.map((corner, index) => (
        <View
          key={index}
          style={[styles.corner, { borderColor: color }, corner]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: "absolute",
    width: LENGTH,
    height: LENGTH,
  },
});
