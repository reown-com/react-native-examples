import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-color';
import { getItem, setItem, STORAGE_KEYS } from '@/utils/storage';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

export default function TabTwoScreen() {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [originalAddress, setOriginalAddress] = useState('');
  const Theme = useTheme();

  const isSaveDisabled = !recipientAddress || recipientAddress === originalAddress;

  useEffect(() => {
    // Load existing recipient address on component mount
    const loadRecipientAddress = async () => {
      try {
        const address = await getItem(STORAGE_KEYS.RECIPIENT_ADDRESS);
        if (address) {
          setRecipientAddress(address);
          setOriginalAddress(address);
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
      setOriginalAddress(recipientAddress);
      showSuccessToast({title: 'Recipient address saved'});
    } catch (error) {
      console.error('Error saving recipient address:', error);
      showErrorToast({title: 'Failed to save recipient address'});
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
          style={[
            styles.textInput,
            { 
              borderColor: Theme.border,
              backgroundColor: Theme.background,
              color: Theme.text 
            }
          ]}
          value={recipientAddress}
          onChangeText={setRecipientAddress}
          placeholder="Enter recipient address"
          placeholderTextColor={Theme.placeholder}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.saveButton, 
            { 
              backgroundColor: isSaveDisabled ? Theme.buttonDisabled : Theme.primary 
            }
          ]}
          onPress={handleSaveAddress}
          disabled={isSaveDisabled}
        >
          <ThemedText style={styles.saveButtonText}>Save Address</ThemedText>
        </TouchableOpacity>
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
