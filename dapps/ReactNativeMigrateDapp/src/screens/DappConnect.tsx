import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useWalletConnect } from '@walletconnect/react-native-dapp';

function DappConnect() {
  const connector = useWalletConnect();
  console.log(connector);
  return (
    <View style={styles.container}>
      {connector?.connected && (
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
        </View>
      )}
      {connector?.connected ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => connector.killSession()}>
          <Text style={styles.buttonText}>Kill session</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.connectContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => connector.connect()}>
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
    width: '100%',
    alignItems: 'center',
  },
  connectContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 32,
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
