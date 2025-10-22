import PaymentStep from '@/components/payment-step';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NetworkKey, NETWORKS } from '@/constants/networks';
import { usePOS } from '@/context/POSContext';
import { usePOSListener } from '@/hooks/use-pos-listener';
import { UnknownOutputParams, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface ScreenParams extends UnknownOutputParams {
  amount: string;
  token: string;
  network: NetworkKey;
  recipientAddress: string;
}

export default function QRModalScreen() {
  const params = useLocalSearchParams<ScreenParams>();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isPaymentRequested, setIsPaymentRequested] = useState(false);
  const [isPaymentBroadcasted, setIsPaymentBroadcasted] = useState(false);
  const [isPaymentFailed, setIsPaymentFailed] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [isPaymentRejected, setIsPaymentRejected] = useState(false);

  const [qrUri, setQrUri] = useState('');
  const {posClient} = usePOS();

  // Extract data from URL parameters
  const { amount, token, network, recipientAddress } = params;

  usePOSListener('connected', () => {
    console.log('Connected to wallet');
    setIsWalletConnected(true);
  });

  usePOSListener('disconnected', () => {
    console.log('Disconnected from wallet');
  });

  usePOSListener('connection_failed', () => {
    console.log('Connection failed');
  });

  usePOSListener('connection_rejected', () => {
    console.log('Connection rejected');
  });

  usePOSListener('qr_ready', ({uri}) => {
    console.log('QR ready');
    setQrUri(uri);
  });

  usePOSListener('payment_requested', () => {
    console.log('Payment requested');
    setIsPaymentRequested(true);
  });

  usePOSListener('payment_rejected', () => {
    console.log('Payment rejected');
    setIsPaymentRejected(true);
  });

  usePOSListener('payment_broadcasted', () => {
    console.log('Payment broadcasted');
    setIsPaymentBroadcasted(true);
  });

  usePOSListener('payment_failed', () => {
    console.log('Payment failed');
    setIsPaymentFailed(true);
  });

  usePOSListener('payment_successful', () => {
    console.log('Payment successful');
    setIsPaymentSuccessful(true);
  });

  useEffect(() => {
    const networkData = NETWORKS[network];
    const paymentIntent = {
      token: {
        network: { name: networkData.name, chainId: networkData.id },
        symbol: token, // TODO: improve data sent from params
        standard: "ERC20", // TODO: improve data sent from params
        address: networkData.usdcAddress, // TODO: improve data sent from params
      },
      amount,
      recipient: `${networkData.id}:${recipientAddress}`,
    };

    console.log('requesting payment', paymentIntent);
    posClient?.createPaymentIntent({paymentIntents: [paymentIntent]});
    //set loader

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemedView style={styles.container}>
      {qrUri ? (
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.qrTitle}>
            Scan to Pay
          </ThemedText>
          
          <ThemedView style={styles.qrContainer}>
            <QRCode
              value={qrUri}
              size={Math.min(Dimensions.get('window').width * 0.6, 350)}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </ThemedView>
          
          <ThemedText style={styles.amountText}>
            {amount} {token} on {network}
          </ThemedText>
          <ThemedView style={styles.statusContainer}>
            <PaymentStep isCompleted={isWalletConnected} isError={false} text="Scan QR - Waiting for wallet connection" />
            <PaymentStep isCompleted={isPaymentRequested} isError={isPaymentFailed} text="Sending transaction" />
            <PaymentStep isCompleted={isPaymentBroadcasted} isError={isPaymentFailed || isPaymentRejected} text="Confirming transaction" />
            <PaymentStep isCompleted={isPaymentSuccessful} isError={isPaymentFailed || isPaymentRejected} text="Payment successful" />
          </ThemedView>
        </ThemedView>
      ) : (<>
        <ThemedView style={[styles.content, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#FAFAFA" />
          <ThemedText>Generating QR Code...</ThemedText>
        </ThemedView>
      </>)}

      {/* {paymentStatus === 'confirmed' && (
        <ThemedView style={styles.content}>
          <IconSymbol name="checkmark.circle.fill" size={60} color="#28A745" />
          <ThemedText style={styles.successText}>Payment Confirmed!</ThemedText>
          
          <ThemedView style={styles.detailsContainer}>
            <ThemedText style={styles.detailsText}>
              Amount: {amount} {token}
            </ThemedText>
            <ThemedText style={styles.detailsText}>
              Network: {network}
            </ThemedText>
          </ThemedView>

          <TouchableOpacity style={styles.actionButton} onPress={handleNewPayment}>
            <ThemedText style={styles.actionButtonText}>New Payment</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {paymentStatus === 'failed' && (
        <ThemedView style={styles.content}>
          <IconSymbol name="xmark.circle.fill" size={60} color="#DC3545" />
          <ThemedText style={styles.errorText}>Payment Failed</ThemedText>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleRetry}>
            <ThemedText style={styles.actionButtonText}>Retry</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleNewPayment}>
            <ThemedText style={styles.actionButtonText}>New Payment</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )} */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  qrTitle: {
    marginBottom: 30,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#007BFF',
  },
  instructionText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statusContainer: {
    width: '100%',
    gap: 8,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  waitingText: {
    fontSize: 16,
    color: '#007BFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  successText: {
    fontSize: 24,
    color: '#28A745',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 24,
    color: '#DC3545',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#3a3a3a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
    minWidth: 150,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});