import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useWalletConnectModal,
  WalletConnectModal,
} from '@walletconnect/modal-react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import {createPublicClient, createWalletClient, custom, parseEther} from 'viem';
import {goerli} from 'viem/chains';

import ContractUtils from './utils/ContractUtils';
import ConfigUtils from './utils/ConfigUtils';
import {RequestModal} from './components/RequestModal';

function App(): JSX.Element {
  const {isConnected, provider, open} = useWalletConnectModal();
  const [client, setClient] = useState<any>();
  const [publicClient, setPublicClient] = useState<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [rpcResponse, setRpcResponse] = useState<any>();
  const [loading, setLoading] = useState(false);

  // Init viem when the wallet is connected
  useEffect(() => {
    if (isConnected && provider) {
      const _client = createWalletClient({
        chain: goerli,
        transport: custom(provider),
      });

      const _publicClient = createPublicClient({
        chain: goerli,
        transport: custom(provider),
      });

      setClient(_client);
      setPublicClient(_publicClient);
    }
  }, [isConnected, provider]);

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
    const [address] = await client.getAddresses();

    const hash = await client.sendTransaction({
      account: address,
      to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
      value: parseEther('0.001'),
    });

    return {
      method: 'send transaction',
      response: hash,
    };
  };

  const onSignMessage = async () => {
    const [address] = await client.getAddresses();

    const signature = await client.signMessage({
      account: address,
      message: 'Hello World!',
    });
    return {
      method: 'sign message',
      signature: signature,
    };
  };

  const onReadContract = async () => {
    const [account] = await client.getAddresses();

    const data = await publicClient.readContract({
      account,
      address: ContractUtils.contractAddress,
      abi: ContractUtils.goerliABI,
      functionName: 'totalSupply',
    });

    return {
      method: 'read contract',
      data,
    };
  };

  const onWriteContract = async () => {
    const [account] = await client.getAddresses();

    const {request} = await publicClient.simulateContract({
      account,
      address: ContractUtils.contractAddress,
      abi: ContractUtils.goerliABI,
      functionName: 'mint',
    });
    const hash = await client.writeContract(request);

    return {
      method: 'write contract',
      response: hash,
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
        <TouchableOpacity
          style={[styles.button, !isConnected && styles.buttonDisabled]}
          disabled={!isConnected}
          onPress={onAction(onReadContract)}>
          <Text style={styles.buttonText}>Read Contract</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !isConnected && styles.buttonDisabled]}
          disabled={!isConnected}
          onPress={onAction(onWriteContract)}>
          <Text style={styles.buttonText}>Write Contract</Text>
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
