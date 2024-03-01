import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import SubscriptionItemSkeleton from './SubscriptionItemSkeleton';

import useColors from '@/hooks/useColors';
import {useWeb3Modal} from '@web3modal/wagmi-react-native';
import {useAccount, useSignMessage} from 'wagmi';
import useNotifyClientContext from '../hooks/useNotifyClientContext';
import {useHeaderHeight} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type OverlayContentProps = {
  title: string;
  description: string;
  onPress: () => void;
};

function OverlayContent({title, description, onPress}: OverlayContentProps) {
  const Theme = useColors();

  return (
    <View style={styles.overlayContentContainer}>
      <Text style={[styles.overlayContentTitle, {color: Theme['inverse-000']}]}>
        {title}
      </Text>
      <Text
        style={[styles.overlayContentDescription, {color: Theme['fg-100']}]}>
        {description}
      </Text>
      <Pressable
        style={({pressed}) => [
          styles.overlayContentButton,
          {
            backgroundColor: pressed ? Theme['accent-010'] : Theme['bg-100'],
            borderColor: Theme['fg-150'],
            shadowColor: Theme['bg-100'],
          },
        ]}
        onPress={onPress}>
        <Text
          style={{
            color: Theme['inverse-000'],
            fontSize: 18,
          }}>
          Sign Message
        </Text>
      </Pressable>
    </View>
  );
}

export default function SubscriptionsConnectOverlay() {
  const {address} = useAccount();
  const {open} = useWeb3Modal();
  const {account, notifyClient} = useNotifyClientContext();
  const {signMessageAsync} = useSignMessage();
  const headerHeight = useHeaderHeight();
  const {top} = useSafeAreaInsets();

  const isRegistered = account
    ? notifyClient?.isRegistered({
        account,
        domain: '',
        allApps: true,
      })
    : false;

  async function registerAccount() {
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
  }

  if (address && isRegistered) {
    return null;
  }

  return (
    <View style={[styles.container, {paddingTop: headerHeight + top}]}>
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <SubscriptionItemSkeleton style={{opacity: 1 - index * 0.2}} />
        ))}
      {address && !isRegistered ? (
        <OverlayContent
          title="Connect"
          description="Connect your account to subscribe to dApps."
          onPress={registerAccount}
        />
      ) : null}
      {address ? null : (
        <OverlayContent
          title="Connect"
          description="Connect your account to subscribe to dApps."
          onPress={open}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 8,
    gap: 8,
  },
  overlayContentContainer: {
    position: 'absolute',
    top: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  overlayContentTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  overlayContentDescription: {
    fontSize: 18,
    textAlign: 'center',
  },
  overlayContentButton: {
    width: 'auto',
    height: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
