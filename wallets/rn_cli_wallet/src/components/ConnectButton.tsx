import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface IConnectButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

//ToDo: QOL - Replace Text with W3WText Component
export function ConnectButton({onPress, disabled, style}: IConnectButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={style}>
      <LinearGradient
        colors={disabled ? ['#9EA9A9', '#798686'] : ['#3396FF', '#0D7DF2']}
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
