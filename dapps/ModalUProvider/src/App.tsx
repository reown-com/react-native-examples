import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import '@walletconnect/react-native-compat';
import {
  useWalletConnectModal,
  WalletConnectModal,
} from '@walletconnect/modal-react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import {numberToHex, sanitizeHex, utf8ToHex} from '@walletconnect/encoding';

import ConfigUtils from './utils/ConfigUtils';
import {RequestModal} from './components/RequestModal';

function App(): JSX.Element {
  const {isConnected, provider, open} = useWalletConnectModal();
  const [modalVisible, setModalVisible] = useState(false);
  const [rpcResponse, setRpcResponse] = useState<any>();
  const [loading, setLoading] = useState(false);

  const onConnect = () => {
    if (isConnected) {
      return provider?.disconnect();
    }
    return open();
  };

  const onCopy = (value: string) => {
    Clipboard.setString(value);
  };

  const onResponse = (response: any) => {
    setRpcResponse(response);
    setLoading(false);
  };

  const onModalClose = () => {
    setModalVisible(false);
    setLoading(false);
    setRpcResponse(undefined);
  };

  const onAction = (callback: any) => async () => {
    try {
      setLoading(true);
      setModalVisible(true);
      const response = await callback();
      onResponse(response);
    } catch (error: any) {
      onResponse({
        error: error?.message || 'error',
      });
    }
  };

  const onSendTransaction = async () => {
    if (!provider) {
      return;
    }

    const chainId = await provider.request({
      method: 'eth_chainId',
    });
    const amount = sanitizeHex(numberToHex(0.0001));

    const accounts: string[] | undefined = await provider?.request({
      method: 'eth_accounts',
    });

    if (!accounts) {
      return;
    }

    const address = accounts[0];

    const transaction = {
      from: address,
      to: '0x704457b418E9Fb723e1Bc0cB98106a6B8Cf87689', // test address
      value: amount,
      chainId,
      data: '0x',
    };

    const txResponse = await provider.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    });

    return {
      method: 'send transaction',
      result: txResponse,
    };
  };

  const onSignMessage = async () => {
    if (!provider) {
      return;
    }

    const accounts: string[] | undefined = await provider?.request({
      method: 'eth_accounts',
    });

    if (!accounts) {
      return;
    }

    const address = accounts[0];

    const message = utf8ToHex('Hello World!');
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address],
    });

    return {
      method: 'sign message',
      signature: signature,
    };
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={onConnect}>
          <Text style={styles.buttonText}>
            {isConnected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !isConnected && styles.buttonDisabled]}
          disabled={!isConnected}
          onPress={onAction(onSendTransaction)}>
          <Text style={styles.buttonText}>Send Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !isConnected && styles.buttonDisabled]}
          disabled={!isConnected}
          onPress={onAction(onSignMessage)}>
          <Text style={styles.buttonText}>Sign Message</Text>
        </TouchableOpacity>
      </View>
      <WalletConnectModal
        projectId={ConfigUtils.ENV_PROJECT_ID}
        providerMetadata={ConfigUtils.providerMetadata}
        sessionParams={ConfigUtils.sessionParams}
        onCopyClipboard={onCopy}
      />
      <RequestModal
        isVisible={modalVisible}
        onClose={onModalClose}
        isLoading={loading}
        rpcResponse={rpcResponse}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3396FF',
    borderRadius: 20,
    width: 200,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
});

export default App;
