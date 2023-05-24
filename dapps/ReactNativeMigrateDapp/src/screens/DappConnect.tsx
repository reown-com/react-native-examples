import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useWalletConnect } from '@walletconnect/react-native-dapp';
import { signMessage } from '../utils/MethodUtils';

function DappConnect() {
  const connector = useWalletConnect();
  const [result, setResult] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const onKillSession = () => {
    connector.killSession();
    setResult(undefined);
    setLoading(false);
  };

  const wrapAction = async (action: any) => {
    setLoading(true);
    try {
      const _result = await action(connector);
      setResult(JSON.stringify(_result, null, 2));
    } catch (error: any) {
      setResult(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      {connector?.connected ? (
        <View>
          <Image
            style={styles.icon}
            source={{ uri: connector.peerMeta?.icons[0] }}
          />
          <View style={styles.card}>
            <Text style={styles.title}>Connected to:</Text>
            <Text>{connector.peerMeta?.name}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>Accounts:</Text>
            {connector.accounts?.map(account => (
              <Text key={account}>{account}</Text>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>Chain ID:</Text>
            <Text>{connector.chainId}</Text>
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
        </View>
      ) : (
        <View style={styles.connectContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => connector.connect()}>
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
    alignItems: 'center',
  },
  connectContainer: {
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
