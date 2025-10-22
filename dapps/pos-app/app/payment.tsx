import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NETWORKS } from '@/constants/networks';
import { getItem, STORAGE_KEYS } from '@/utils/storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';

const TOKENS = ['USDC'];
const AVAILABLE_NETWORKS = Object.keys(NETWORKS);

interface FormData {
  amount: string;
  token: string;
  network: string;
}

const useAmountFormatter = () => {
  const formatAmount = (text: string) => {
    // Allow only digits, one comma or dot, and up to 2 decimal places
    const cleanedText = text
      .replace(/[^0-9,.]/g, '') // Remove any non-numeric characters except comma and dot
      .replace(/(,.*),/g, '$1') // Remove multiple commas, keep only the first one
      .replace(/(\..*)\./g, '$1') // Remove multiple dots, keep only the first one
      .replace(/(,.*)\./g, '$1') // If there's already a comma, don't allow dots
      .replace(/(\..*),/g, '$1'); // If there's already a dot, don't allow commas
    
    // Transform dot to comma for display
    const displayValue = cleanedText.replace('.', ',');
    
    return displayValue;
  };

  const getFormValue = (displayValue: string) => {
    // Convert comma back to dot for form validation
    return displayValue.replace(',', '.');
  };

  return { formatAmount, getFormValue };
};

export default function PaymentScreen() {
  const [recipientAddress, setRecipientAddress] = useState('');
  const { formatAmount } = useAmountFormatter();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      amount: '',
      token: TOKENS[0],
      network: AVAILABLE_NETWORKS[0]
    }
  });

  const watchedToken = watch('token');
  const watchedNetwork = watch('network');

  useEffect(() => {
    loadRecipientAddress();
  }, []);

  const loadRecipientAddress = async () => {
    try {
      const address = await getItem(STORAGE_KEYS.RECIPIENT_ADDRESS);
      if (address) {
        setRecipientAddress(address);
      } else {
        Alert.alert('No Recipient', 'Please set recipient address in Settings');
        router.back();
      }
    } catch (error) {
      console.error('Error loading recipient address:', error);
    }
  };

  const onSubmit = (data: FormData) => {   
    router.push({
      pathname: '/qr-modal',
      params: {
        amount: data.amount.replace(',', '.'),
        token: data.token,
        network: data.network,
        recipientAddress,
      }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
          <>
            {/* Amount Input */}
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Amount to Pay</ThemedText>
              <Controller
                control={control}
                name="amount"
                rules={{ 
                  required: 'Amount is required',
                  pattern: {
                    value: /^\d+([,.]\d{1,10})?$/,
                    message: 'Invalid amount format'
                  }
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.amount && styles.inputError]}
                    value={value}
                    onChangeText={(text) => {
                      const formattedText = formatAmount(text);
                      onChange(formattedText);
                    }}
                    placeholder="Enter amount (e.g., 50.00)"
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                )}
              />
              {errors.amount && (
                <ThemedText style={styles.errorText}>{errors.amount.message}</ThemedText>
              )}
            </ThemedView>

            {/* Token Selector */}
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Select Token</ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.buttonContainer}
              >
                {TOKENS.map(token => (
                  <TouchableOpacity
                    key={token}
                    style={[
                      styles.optionButton,
                      watchedToken === token && styles.optionButtonSelected
                    ]}
                    onPress={() => setValue('token', token)}
                  >
                    <ThemedText style={[
                      styles.optionButtonText,
                      watchedToken === token && styles.optionButtonTextSelected
                    ]}>
                      {token}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>

            {/* Network Selector */}
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Select Network</ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.buttonContainer}
              >
                {AVAILABLE_NETWORKS.map(network => (
                  <TouchableOpacity
                    key={network}
                    style={[
                      styles.optionButton,
                      watchedNetwork === network && styles.optionButtonSelected
                    ]}
                    onPress={() => setValue('network', network)}
                  >
                    <ThemedText style={[
                      styles.optionButtonText,
                      watchedNetwork === network && styles.optionButtonTextSelected
                    ]}>
                      {network}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>

            <TouchableOpacity 
              style={styles.generateButton}
              onPress={handleSubmit(onSubmit)}
            >
              <IconSymbol name="qrcode" size={20} color="white" />
              <ThemedText style={styles.generateButtonText}>Generate QR Code</ThemedText>
            </TouchableOpacity>
          </>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginTop: 8,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#DC3545',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  optionButtonSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  optionButtonTextSelected: {
    color: 'white',
  },
  generateButton: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});