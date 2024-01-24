import React from 'react';
import {TouchableOpacity, StyleSheet, Image} from 'react-native';

import clipboardImage from '../assets/Copy.png';
import QRCodeImage from '../assets/QRCode.png';
import {useTheme} from '../hooks/useTheme';

interface CircleActionButtonProps {
  copyImage: boolean;
  handlePress: () => void;
}

export function CircleActionButton({
  copyImage,
  handlePress,
}: CircleActionButtonProps) {
  const Theme = useTheme();
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, {backgroundColor: Theme['accent-100']}]}>
      <Image
        source={copyImage ? clipboardImage : QRCodeImage}
        style={styles.imageContainer}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 20,
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
});
