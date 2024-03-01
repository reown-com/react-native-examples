import {useWeb3Modal} from '@web3modal/wagmi-react-native';
import {
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  View,
  Linking,
  Alert,
} from 'react-native';
import {useAccount, useDisconnect, useSignMessage} from 'wagmi';
import WelcomeWallet from '@/icons/welcome-wallet';
import Background from '@/icons/welcome-background.png';
import SignatureModal from '@/modals/SignatureModal';
import {useEffect, useState} from 'react';
import Button from '@/components/Button';
import {Spacing} from '@/utils/ThemeUtil';
import {Text} from '@/components/Text';
import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import BootSplash from 'react-native-bootsplash';
import {useNavigation} from '@react-navigation/native';

export default function ConnectScreen() {
  const [isSignModalVisible, setSignModalVisible] = useState(false);
  const {open} = useWeb3Modal();
  const {isConnected, isConnecting} = useAccount();
  const {account, notifyClient} = useNotifyClientContext();
  const {signMessageAsync} = useSignMessage();
  const {disconnect, isLoading: isDisconnecting} = useDisconnect();
  const {navigate} = useNavigation();

  const onLinkPress = () => {
    Linking.openURL('https://web3inbox.com');
  };

  async function onRegisterAccount() {
    if (!notifyClient) {
      Alert.alert('Notify client not initialized');
      return;
    }

    if (!account) {
      Alert.alert('Account not initialized');
      return;
    }

    const {message, registerParams} = await notifyClient.prepareRegistration({
      account,
      domain: '',
      allApps: true,
    });
    const signature = await signMessageAsync({message: message});

    await notifyClient.register({
      registerParams,
      signature,
    });
    setSignModalVisible(false);
    navigate('Home');
  }

  const onModalDismiss = async () => {
    if (isConnected) {
      disconnect();
      setSignModalVisible(false);
    }
  };

  useEffect(() => {
    // Wait until wagmi inits and then hide the splash screen
    if (!isConnected && !isConnecting) {
      BootSplash.hide({fade: true});
    }

    if (isConnected && notifyClient && account) {
      const isRegistered = notifyClient?.isRegistered({
        account,
        domain: '',
        allApps: true,
      });

      if (isRegistered) {
        navigate('Home');
      } else {
        setSignModalVisible(true);
      }

      BootSplash.hide({fade: true});
    }
  }, [isConnected, isConnecting, notifyClient, account, navigate]);

  return (
    <ImageBackground style={styles.container} source={Background}>
      <WelcomeWallet height={68} style={styles.walletIcon} />
      <Text variant="large-600">Welcome to Web3Inbox</Text>
      <Text variant="small-400" center color="fg-200">
        Connect your wallet to start using Web3Inbox today
      </Text>
      <Button
        label={'Connect Wallet'}
        disabled={isConnecting || isDisconnecting}
        loading={isConnecting || isDisconnecting}
        onPress={() => open()}
        style={styles.button}
        labelStyle={styles.buttonText}
      />
      <View style={styles.footer}>
        <Text variant="small-400" color="fg-200">
          Learn more at
        </Text>
        <TouchableOpacity onPress={onLinkPress}>
          <Text variant="small-400" color="accent-100">
            web3inbox.com
          </Text>
        </TouchableOpacity>
      </View>
      <SignatureModal
        isVisible={isSignModalVisible}
        onDismiss={onModalDismiss}
        onSignPress={onRegisterAccount}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
    rowGap: 8,
  },
  walletIcon: {
    marginBottom: 30,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: Spacing['2xs'],
    paddingHorizontal: Spacing.s,
  },
  buttonText: {
    fontSize: 14,
  },
});
