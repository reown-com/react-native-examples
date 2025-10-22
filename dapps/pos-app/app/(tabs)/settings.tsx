import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { getItem, setItem, STORAGE_KEYS } from '@/utils/storage';

export default function TabTwoScreen() {
  const [recipientAddress, setRecipientAddress] = useState('');

  useEffect(() => {
    // Load existing recipient address on component mount
    const loadRecipientAddress = async () => {
      try {
        const address = await getItem(STORAGE_KEYS.RECIPIENT_ADDRESS);
        if (address) {
          setRecipientAddress(address);
        }
      } catch (error) {
        console.error('Error loading recipient address:', error);
      }
    };

    loadRecipientAddress();
  }, []);

  const handleSaveAddress = async () => {
    try {
      await setItem(STORAGE_KEYS.RECIPIENT_ADDRESS, recipientAddress);
      Alert.alert('Success', 'Recipient address saved successfully!');
    } catch (error) {
      console.error('Error saving recipient address:', error);
      Alert.alert('Error', 'Failed to save recipient address');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Settings
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.inputContainer}>
        <ThemedText type="subtitle" style={styles.label}>
          Recipient Address
        </ThemedText>
        <TextInput
          style={styles.textInput}
          value={recipientAddress}
          onChangeText={setRecipientAddress}
          placeholder="Enter recipient address"
          placeholderTextColor="#666"
          multiline
          numberOfLines={3}
        />
        <ThemedText 
          type="default" 
          style={styles.saveButton}
          onPress={handleSaveAddress}
        >
          Save Address
        </ThemedText>
      </ThemedView>
      
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  inputContainer: {
    marginTop: 20,
    padding: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
});
