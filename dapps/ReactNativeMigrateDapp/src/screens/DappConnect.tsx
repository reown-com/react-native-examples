import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Web3Modal, useWeb3Modal } from '@web3modal/react-native';
import { signMessage } from '../utils/MethodUtils';

const PROJECT_ID = 'YOUR_PROJECT_ID';

const clientMeta = {
  name: 'Migrated v2 App',
  description: 'RN dApp by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export const sessionParams = {
  namespaces: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
      ],
      chains: ['eip155:1'],
      events: ['chainChanged', 'accountsChanged'],
      rpcMap: {},
    },
  },
};

function DappConnect() {
  const { isConnected, provider, open, address } = useWeb3Modal();
  const [result, setResult] = useState<string | undefined>('');
  const [loading, setLoading] = useState(false);

  const peerMeta = useMemo(() => {
    if (isConnected) {
      return provider?.session?.peer.metadata;
    }
  }, [isConnected, provider]);

  const onKillSession = () => {
    provider?.disconnect();
    setResult(undefined);
    setLoading(false);
  };

  const wrapAction = async (action: any) => {
    setLoading(true);
    setResult(undefined);
    try {
      const _result = await action(provider, address);
      setResult(JSON.stringify(_result, null, 2));
    } catch (error: any) {
      setResult(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isConnected ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          {peerMeta && (
            <>
              <Image style={styles.icon} source={{ uri: peerMeta?.icons[0] }} />
              <View style={styles.card}>
                <Text style={styles.title}>Connected to:</Text>
                <Text>{peerMeta?.name}</Text>
              </View>
            </>
          )}
          <View style={styles.card}>
            <Text style={styles.title}>Account:</Text>
            <Text>{address}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>Action result:</Text>
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text>{result}</Text>
            )}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => wrapAction(signMessage)}>
              <Text style={styles.buttonText}>Personal Sign</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onKillSession}>
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.connectContainer}>
          <TouchableOpacity style={styles.button} onPress={() => open()}>
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      )}
      <Web3Modal
        projectId={PROJECT_ID}
        providerMetadata={clientMeta}
        sessionParams={sessionParams}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  connectContainer: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    alignItems: 'center',
  },
  card: {
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  button: {
    backgroundColor: '#3396FF',
    borderRadius: 25,
    width: 200,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 20,
  },
});

export default DappConnect;
