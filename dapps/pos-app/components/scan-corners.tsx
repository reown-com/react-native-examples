import React from "react";
import { StyleSheet, View } from "react-native";

interface ScanCornersProps {
  // Side length of the square the corners are drawn around.
  size: number;
  color: string;
  // Length of each corner's arm.
  length?: number;
  thickness?: number;
  radius?: number;
}

// Four L-shaped corner brackets forming a viewfinder-style square. Built from
// plain bordered Views (pos-app has no react-native-svg) so it renders the same
// on iOS, Android and web. Reused at a small size as the "scan" input icon and
// at a large size as the camera viewfinder frame.
export function ScanCorners({
  size,
  color,
  length = Math.round(size * 0.32),
  thickness = 2,
  radius = 4,
}: ScanCornersProps) {
  const corner = { width: length, height: length, borderColor: color };
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.corner,
          styles.topLeft,
          corner,
          {
            borderTopWidth: thickness,
            borderLeftWidth: thickness,
            borderTopLeftRadius: radius,
          },
        ]}
      />
      <View
        style={[
          styles.corner,
          styles.topRight,
          corner,
          {
            borderTopWidth: thickness,
            borderRightWidth: thickness,
            borderTopRightRadius: radius,
          },
        ]}
      />
      <View
        style={[
          styles.corner,
          styles.bottomLeft,
          corner,
          {
            borderBottomWidth: thickness,
            borderLeftWidth: thickness,
            borderBottomLeftRadius: radius,
          },
        ]}
      />
      <View
        style={[
          styles.corner,
          styles.bottomRight,
          corner,
          {
            borderBottomWidth: thickness,
            borderRightWidth: thickness,
            borderBottomRightRadius: radius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: "absolute",
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
});
