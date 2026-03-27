import React from 'react';
import { StyleSheet, View } from 'react-native';
import { reownGray, reownGreen, reownOrange, reownWhite } from '@/constants/Colors';

export default function ReownFigures() {
  return (
    <View style={styles.rightColumn}>
      <View style={styles.orangeCircle}>
        <View style={styles.whiteCircle} />
      </View>
      <View style={styles.smallCirclesRow}>
        <View style={styles.greenCircle} />
        <View style={styles.whiteSquare} />
      </View>
      <View style={styles.grayRectangle} />
    </View>
  );
}

const styles = StyleSheet.create({
  rightColumn: {
    width: '50%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 3,
  },
  orangeCircle: {
    backgroundColor: reownOrange,
    height: 80,
    width: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteCircle: {
    backgroundColor: reownWhite,
    height: 65,
    width: 65,
    borderRadius: 25,
  },
  smallCirclesRow: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  greenCircle: {
    backgroundColor: reownGreen,
    height: 40,
    width: 40,
    borderRadius: 100,
  },
  whiteSquare: {
    backgroundColor: reownWhite,
    height: 40,
    width: 40,
    borderRadius: 12,
  },
  grayRectangle: {
    backgroundColor: reownGray,
    height: 40,
    width: 80,
    borderRadius: 20,
  },
});
