import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useWalletConnect } from '@walletconnect/react-native-dapp';

function DappConnect() {
  const connector = useWalletConnect();
  return (
    <View style={styles.container}>
      {connector?.connected ? (
        <TouchableOpacity onPress={() => connector.killSession()}>
          <Text>Kill session</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => connector.connect()}>
          <Text>Connect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DappConnect;
