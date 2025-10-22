import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePOS } from '@/context/POSContext';
import { useTheme } from '@/hooks/use-theme-color';
import { getItem, STORAGE_KEYS } from '@/utils/storage';
import { router } from 'expo-router';

export default function HomeScreen() {
  const {isInitialized} = usePOS();
  const [recipientAddress, setRecipientAddress] = useState('');
  const Theme = useTheme();

  const loadRecipientAddress = async () => {
    const address = await getItem(STORAGE_KEYS.RECIPIENT_ADDRESS);
    setRecipientAddress(address || '');
  };

  useEffect(() => {
    loadRecipientAddress();
  }, []);

  // Reload recipient address when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadRecipientAddress = async () => {
        const address = await getItem(STORAGE_KEYS.RECIPIENT_ADDRESS);
        setRecipientAddress(address || '');
      };
      loadRecipientAddress();
    }, [])
  );

  const handleStartPayment = () => {
    router.push('/payment');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.logo}
        />
      }>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="title" style={styles.title}>
          POS Terminal
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.subtitle}>
          Crypto payment system powered by WalletConnect
        </ThemedText>
      </ThemedView>
      {recipientAddress ? 
        <ThemedText type="defaultSemiBold" style={styles.subtitle}>
          Recipient Address: {recipientAddress?.slice(0, 6)}...{recipientAddress?.slice(-4)}
        </ThemedText>
        : 
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.primaryButton,
              { 
                backgroundColor: Theme.primary,
                shadowColor: Theme.primary 
              }
            ]}
            onPress={() => {
              router.push('/settings');
            }}
          >
            <IconSymbol name="gearshape.fill" size={20} color="white" />
            <ThemedText style={styles.primaryButtonText}>Set Terminal Address</ThemedText>
          </TouchableOpacity>
      }
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.primaryButton,
            { 
              backgroundColor: (!recipientAddress || !isInitialized) ? Theme.buttonDisabled : Theme.primary,
              shadowColor: Theme.primary 
            }
          ]}
          onPress={handleStartPayment}
          disabled={!recipientAddress || !isInitialized}
        >
          <IconSymbol name="creditcard.fill" size={20} color="white" />
          <ThemedText style={styles.primaryButtonText}>
            Start New Payment
          </ThemedText>
        </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
  },
  stepContainer: {
    gap: 2,
    marginBottom: 8,
  },
  logo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
