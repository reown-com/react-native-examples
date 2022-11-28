import './config/polyfills';
import React, {useEffect, useState} from 'react';
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

import {numberToHex, sanitizeHex} from '@walletconnect/encoding';
import {ethers} from 'ethers';
import {Web3Provider} from '@ethersproject/providers';

import ContractUtils from './utils/ContractUtils';
import ConfigUtils from './utils/ConfigUtils';
import {RequestModal} from './components/RequestModal';

function App(): JSX.Element {
  const {isConnected, provider, open} = useWalletConnectModal();
  const [client, setClient] = useState<Web3Provider>();
  const [modalVisible, setModalVisible] = useState(false);
  const [rpcResponse, setRpcResponse] = useState<any>();
  const [loading, setLoading] = useState(false);

  // Init ethers client when the wallet is connected
  useEffect(() => {
    if (isConnected && provider) {
      const _client = new ethers.providers.Web3Provider(provider);

      setClient(_client);
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
    if (!client) {
      return;
    }

    const signer = client.getSigner();

    const {chainId} = await client.getNetwork();

    const amount = sanitizeHex(numberToHex(0.0001));
    const transaction = {
      to: '0x704457b418E9Fb723e1Bc0cB98106a6B8Cf87689', // test address
      value: amount,
      chainId,
      data: '0x',
    };

    // Send the transaction using the signer
    const txResponse = await signer.sendTransaction(transaction);
    const transactionHash = txResponse.hash;
    console.log('transactionHash is ' + transactionHash);

    // Wait for the transaction to be mined (optional)
    const receipt = await txResponse.wait();
    console.log('Transaction was mined in block:', receipt.blockNumber);

    return {
      method: 'send transaction',
      blockNumber: receipt.blockNumber,
      result: transactionHash,
    };
  };

  const onSignMessage = async () => {
    if (!client) {
      return;
    }

    const [address] = await client.listAccounts();
    const signer = client.getSigner(address);

    const signature = await signer?.signMessage('Hello World!');
    return {
      method: 'sign message',
      signature: signature,
    };
  };

  const onReadContract = async () => {
    const contract = new ethers.Contract(
      ContractUtils.contractAddress,
      ContractUtils.goerliABI,
      client,
    );

    // Read contract information
    const totalSupply = await contract.totalSupply();

    return {
      method: 'read contract',
      data: totalSupply,
    };
  };

  const onWriteContract = async () => {
    if (!client) {
      return;
    }

    const [address] = await client.listAccounts();
    const signer = client.getSigner(address);

    const contract = new ethers.Contract(
      ContractUtils.contractAddress,
      ContractUtils.goerliABI,
      signer,
    );

    const receipt = await contract.mint();
    const hash = receipt.hash;
    console.log('receipt', receipt);
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
