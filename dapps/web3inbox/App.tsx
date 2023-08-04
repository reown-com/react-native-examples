import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import '@walletconnect/react-native-compat';
import {Web3Inbox} from '@walletconnect/web3inbox-webview';
// @ts-expect-error - env is a virtualised module via Babel config.
import {ENV_PROJECT_ID} from '@env';
import {
  WalletConnectModal,
  useWalletConnectModal,
} from '@walletconnect/modal-react-native';

const providerMetadata = {
  name: 'Web3Inbox React Native Example',
  description:
    'An example app to showcase how to use Web3Inbox React Native SDK',
  url: 'https://github.com/WalletConnect/web3inbox-js-sdk',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com',
  },
};

const projectId = ENV_PROJECT_ID as string;

export default function Native() {
  const {provider, isConnected, address, open} = useWalletConnectModal();
  const [isVisible, setIsVisible] = useState(true);

  const toggleWeb3InboxModal = useCallback(
    () => setIsVisible(isCurrentlyVisible => !isCurrentlyVisible),
    [],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Web3Inbox React Native Webview</Text>
      <TouchableOpacity
        onPress={() => open()}
        style={[styles.button, isConnected && styles.disabled]}
        disabled={isConnected}>
        <Text style={styles.text}>{isConnected ? 'Connected' : 'Connect'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={toggleWeb3InboxModal}
        style={[styles.button, !isConnected && styles.disabled]}
        disabled={!isConnected}>
        <Text style={styles.text}>Open Web3Inbox</Text>
      </TouchableOpacity>
      <WalletConnectModal
        projectId={projectId}
        providerMetadata={providerMetadata}
      />
      {address && isConnected && (
        <Web3Inbox
          projectId={projectId}
          ethAddress={address}
          onSign={async (message: string) => {
            const response = await provider?.request(
              {
                method: 'personal_sign',
                params: [message, address],
              },
              'eip155:1',
            );
            return response as string;
          }}
          visible={isVisible}
          setVisible={toggleWeb3InboxModal}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 20,
    fontSize: 36,
  },
  button: {
    height: 50,
    width: 200,
    backgroundColor: '#47A1FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    marginBottom: 10,
  },
  disabled: {
    backgroundColor: '#A8B0B0',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
