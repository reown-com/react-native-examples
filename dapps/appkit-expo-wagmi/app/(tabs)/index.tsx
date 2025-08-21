import { AppKitButton } from '@reown/appkit-wagmi-react-native';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#202020', dark: '#202020' }}
        headerImage={
          <Image
            source={require('@/assets/images/reown-header.png')}
            style={styles.reownLogo}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">AppKit</ThemedText>
          <ThemedText type="subtitle">for React Native</ThemedText>
          <HelloWave />
        </ThemedView>
        <AppKitButton connectStyle={styles.appKitButton} label='Connect Wallet' />
      </ParallaxScrollView>

    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  reownLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  appKitButton: {
    marginTop: 20,
  },
});
