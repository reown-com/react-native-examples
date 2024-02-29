import useColors from '@/hooks/useColors';
import {useWeb3Modal} from '@web3modal/wagmi-react-native';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ImageBackground,
  View,
  Linking,
} from 'react-native';
import WelcomeWallet from '../icons/welcome-wallet';
import Background from '../icons/welcome-background.png';

export default function ConnectOverlay() {
  const Theme = useColors();
  const {open} = useWeb3Modal();

  const onLinkPress = () => {
    Linking.openURL('https://web3inbox.com');
  };

  return (
    <ImageBackground style={styles.container} source={Background}>
      <WelcomeWallet height={68} style={styles.walletIcon} />
      <Text style={[styles.title, {color: Theme['fg-100']}]}>
        Welcome to Web3Inbox
      </Text>
      <Text style={[styles.subtitle, {color: Theme['fg-200']}]}>
        Connect your wallet to start using Web3Inbox today
      </Text>
      <TouchableOpacity
        style={[styles.button, {backgroundColor: Theme['accent-100']}]}
        onPress={() => open()}>
        <Text style={[styles.buttonText, {color: Theme['inverse-100']}]}>
          Connect Wallet
        </Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={[styles.footerText, {color: Theme['fg-200']}]}>
          Learn more at
        </Text>
        <TouchableOpacity onPress={onLinkPress}>
          <Text style={[styles.footerText, {color: Theme['accent-100']}]}>
            web3inbox.com
          </Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
    width: 250,
  },
  walletIcon: {
    marginBottom: 30,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
  },
  button: {
    height: 28,
    marginTop: 8,
    paddingHorizontal: 10,
    borderRadius: 28,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
