import { AppKitButton } from '@reown/appkit-wagmi-react-native';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { MobileWave } from '@/components/MobileWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import ReownFigures from '@/components/ReownFigures';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#202020', dark: '#202020' }}
        headerImage={
          <View style={styles.headerContainer}>
            <View style={styles.leftColumn}>
              <Image
                source={require('@/assets/images/reown-logo.png')}
                style={styles.reownLogo}
              />
              <Text style={styles.headerText}>
                Powering the future of the financial internet
              </Text>
            </View>
            <ReownFigures />
          </View>
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">AppKit</ThemedText>
          <ThemedText type="subtitle">for React Native</ThemedText>
          <MobileWave />
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
    height: 48,
    width: 180,
  },
  appKitButton: {
    marginTop: 20,
  },
  headerText: {
    fontFamily: 'KHTekaMono-Regular',
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '600',
    color: '#fff',
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  leftColumn: {
    flexDirection: 'column',
    width: '50%',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 10,
  },
});
