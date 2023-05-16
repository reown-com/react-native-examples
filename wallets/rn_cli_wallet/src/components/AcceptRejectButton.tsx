import React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface IAcceptRejectButtonProps {
  accept: boolean;
  onPress: () => void;
}

export function AcceptRejectButton({
  accept,
  onPress,
}: IAcceptRejectButtonProps) {
  const acceptButtonColor = accept
    ? ['#2BEE6C', '#1DC956']
    : ['#F25A67', '#F05142'];

  const buttonText = accept ? 'Accept' : 'Decline';

  return (
    <TouchableOpacity
      style={!accept ? styles.accept : null}
      onPress={() => onPress()}>
      <LinearGradient colors={acceptButtonColor} style={styles.buttonContainer}>
        <Text style={styles.mainText}>{buttonText}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  accept: {
    marginRight: 20,
  },
  buttonContainer: {
    marginVertical: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    height: 56,
    width: 160,
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
