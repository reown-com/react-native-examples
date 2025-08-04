import '@walletconnect/react-native-compat';
import { AppKit, AppKitButton } from '@reown/appkit-react-native';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { WalletInfoView } from '@/components/WalletInfoView';

export default function HomeScreen() {
  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome!</ThemedText>
          <HelloWave />
        </ThemedView>
        <WalletInfoView />
        <AppKitButton />
      </ParallaxScrollView>
      {/* This is a workaround for the Android modal issue */}
      <View style={styles.androidViewWorkaround}>
        <AppKit />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  //https://github.com/expo/expo/issues/32991#issuecomment-2489620459
  androidViewWorkaround: {
    width: "100%",
    height: "100%",
    position: "absolute",
  }
});
