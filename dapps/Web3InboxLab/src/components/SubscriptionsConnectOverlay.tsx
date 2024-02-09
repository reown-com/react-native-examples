import {Alert, Pressable, Text, View} from 'react-native';
import SubscriptionItemSkeleton from './SubscriptionItemSkeleton';

import useColors from '../utils/theme';
import {useWeb3Modal} from '@web3modal/wagmi-react-native';
import WalletIcon from '../icons/wallet';
import {useAccount, useSignMessage} from 'wagmi';
import useNotifyClientContext from '../hooks/useNotifyClientContext';

export default function SubscriptionsConnectOverlay() {
  const colors = useColors();
  const {address} = useAccount();
  const {open} = useWeb3Modal();
  const {account, notifyClient} = useNotifyClientContext();
  const {signMessageAsync} = useSignMessage();

  const isRegistered = account
    ? notifyClient?.isRegistered({
        account,
        domain: 'w3i-lab-mobile.vercel.app',
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
      domain: 'w3i-lab-mobile.vercel.app',
      allApps: true,
    });
    const signature = await signMessageAsync({message: message});

    await notifyClient.register({
      registerParams,
      signature,
    });
  }

  if (address && isRegistered) return null;

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}>
      <SubscriptionItemSkeleton style={{opacity: 1}} />
      <SubscriptionItemSkeleton style={{opacity: 0.7}} />
      <SubscriptionItemSkeleton style={{opacity: 0.5}} />
      <SubscriptionItemSkeleton style={{opacity: 0.3}} />
      <SubscriptionItemSkeleton style={{opacity: 0.1}} />
      {address && !isRegistered ? (
        <View
          style={{
            position: 'absolute',
            top: 150,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
          <Text
            style={{
              color: colors.primary,
              fontSize: 24,
              fontWeight: '600',
              textAlign: 'center',
            }}>
            Sign Message
          </Text>
          <Text
            style={{
              color: colors.secondary,
              fontSize: 18,
              textAlign: 'center',
            }}>
            Sign message to be able to continue using Web3Inbox
          </Text>
          <Pressable
            style={({pressed}) => ({
              width: 'auto',
              height: 48,
              backgroundColor: pressed
                ? colors.backgroundActive
                : colors.background,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: colors.background,
              shadowOffset: {
                width: 2,
                height: 4,
              },
              shadowOpacity: 0.5,
              shadowRadius: 3.84,
              elevation: 5,
            })}
            onPress={registerAccount}>
            <Text
              style={{
                color: colors.primary,
                fontSize: 18,
              }}>
              Sign Message
            </Text>
          </Pressable>
        </View>
      ) : null}
      {address ? null : (
        <View
          style={{
            position: 'absolute',
            top: 150,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
          <Text
            style={{
              color: colors.primary,
              fontSize: 24,
              fontWeight: '600',
              textAlign: 'center',
            }}>
            Connect
          </Text>
          <Text
            style={{
              color: colors.secondary,
              fontSize: 18,
              textAlign: 'center',
            }}>
            Connect your account to subscribe to dApps.
          </Text>
          <Pressable
            style={({pressed}) => ({
              width: 'auto',
              height: 48,
              backgroundColor: pressed
                ? colors.backgroundActive
                : colors.background,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: colors.background,
              shadowOffset: {
                width: 2,
                height: 4,
              },
              shadowOpacity: 0.5,
              shadowRadius: 3.84,
              elevation: 5,
            })}
            onPress={() => open()}>
            <WalletIcon width={18} height={18} fill={colors.primary} />
            <Text
              style={{
                color: colors.primary,
                fontSize: 18,
              }}>
              Connect Wallet
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
