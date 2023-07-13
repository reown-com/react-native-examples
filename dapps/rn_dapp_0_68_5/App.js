import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native';

const App = () => {
  const { open, isConnected, address, provider } = useWalletConnectModal();
  const PROJECT_ID = "ADD_YOUR_PROJECT_ID_HERE"

  return (
    <SafeAreaView style={styles.container}>
      {isConnected ?
        <View>
          <Text>Connected to {address}</Text>
          <TouchableOpacity onPress={() => provider?.disconnect()}>
            <Text>Disconnect</Text>
        </TouchableOpacity>
        </View>
         :
        <TouchableOpacity onPress={open}>
          <Text>Connect</Text>
        </TouchableOpacity>
      }
      <WalletConnectModal
        projectId={PROJECT_ID}
        providerMetadata={{
          name: 'WalletConnect',
          description: 'Scan qrcode to connect',
          url: 'https://walletconnect.org',
          icons: ['https://walletconnect.org/walletconnect-logo.png'],
          redirect: {
            native:'walletconnect://',
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center'
  }
});

export default App;
