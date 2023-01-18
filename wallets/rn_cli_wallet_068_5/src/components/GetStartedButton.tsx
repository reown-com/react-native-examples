import React from 'react';
import {TouchableOpacity, StyleSheet, Image, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';

export function GetStartedButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
      <LinearGradient
        colors={['#3396FF', '#0D7DF2']}
        style={styles.blueButtonContainer}>
        <Text style={styles.mainText}>Get Started</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  blueButtonContainer: {
    marginBottom: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    height: 56,
    width: 350,
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
