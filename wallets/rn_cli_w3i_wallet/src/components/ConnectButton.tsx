import React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface IConnectButtonProps {
  onPress: () => void;
}

//ToDo: QOL - Replace Text with W3WText Component
export function ConnectButton({onPress}: IConnectButtonProps) {
  return (
    <TouchableOpacity onPress={() => onPress()}>
      <LinearGradient
        colors={['#3396FF', '#0D7DF2']}
        style={styles.blueButtonContainer}>
        <Text style={styles.mainText}>Connect</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  blueButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    height: 46,
    marginTop: 16,
    boxShadow:
      '0px 6px 14px -6px rgba(0, 0, 0, 0.12), 0px 10px 32px -4px rgba(0, 0, 0, 0.1)',
  },
  mainText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: 'white',
  },
  imageContainer: {
    width: 24,
    height: 24,
  },
});
