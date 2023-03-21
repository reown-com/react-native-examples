import React from 'react';
import {TouchableOpacity, StyleSheet, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface CircleActionButtonProps {
  copyImage: boolean;
  handlePress: () => void;
}

const clipboardImage = require('../assets/Copy.png');
const QRCodeImage = require('../assets/QRCode.png');

export function CircleActionButton({
  copyImage,
  handlePress,
}: CircleActionButtonProps) {
  return (
    <TouchableOpacity onPress={handlePress}>
      <LinearGradient
        colors={['#3396FF', '#0D7DF2']}
        style={[styles.blueButtonContainer, styles.shadow]}>
        <Image
          source={copyImage ? clipboardImage : QRCodeImage}
          style={styles.imageContainer}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  blueButtonContainer: {
    marginRight: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    width: 56,
  },
  imageContainer: {
    width: 24,
    height: 24,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },
});
