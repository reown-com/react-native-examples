import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePOSListener } from '@/hooks/use-pos-listener';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

/**
 * Example component demonstrating how to use the usePOSListener hook
 * This shows how to add dynamic listeners from any component
 */
export const POSListenerExample = () => {
  const [lastEvent, setLastEvent] = useState<string>('No events yet');
  const [eventCount, setEventCount] = useState(0);

  // Listen for payment successful events
  usePOSListener('payment_successful', (data: any) => {
    setLastEvent(`Payment Successful: ${JSON.stringify(data)}`);
    setEventCount(prev => prev + 1);
    Alert.alert('Payment Successful!', 'A payment has been completed successfully.');
  });

  // Listen for payment failed events
  usePOSListener('payment_failed', (data: any) => {
    setLastEvent(`Payment Failed: ${JSON.stringify(data)}`);
    setEventCount(prev => prev + 1);
    Alert.alert('Payment Failed', 'A payment has failed.');
  });

  // Listen for connection events
  usePOSListener('connected', () => {
    setLastEvent('Connected to wallet');
    setEventCount(prev => prev + 1);
  });

  usePOSListener('disconnected', () => {
    setLastEvent('Disconnected from wallet');
    setEventCount(prev => prev + 1);
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">POS Event Listener Example</ThemedText>
      <ThemedText>Total Events: {eventCount}</ThemedText>
      <ThemedText>Last Event: {lastEvent}</ThemedText>
      <ThemedText style={styles.note}>
        This component demonstrates how to use usePOSListener hook to listen for POS events dynamically.
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
