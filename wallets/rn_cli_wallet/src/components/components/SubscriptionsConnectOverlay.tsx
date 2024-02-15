import {Alert, Pressable, Text, View} from 'react-native';
import SubscriptionItemSkeleton from './SubscriptionItemSkeleton';

import WalletIcon from '@/icons/wallet';
import useNotifyClientContext from '@/hooks/useNotifyClientContext';
import {useSnapshot} from 'valtio';
import SettingsStore from '@/store/SettingsStore';
import {createOrRestoreEIP155Wallet} from '@/utils/EIP155WalletUtil';
import {useTheme} from '@/hooks/useTheme';

export default function SubscriptionsConnectOverlay() {
  const Theme = useTheme();

  const {eip155Address: address} = useSnapshot(SettingsStore.state);
  const {account, notifyClient} = useNotifyClientContext();

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

    const {eip155Wallets} = await createOrRestoreEIP155Wallet();

    const signature = await eip155Wallets[address].signMessage(message);

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
              color: Theme['accent-100'],
              fontSize: 24,
              fontWeight: '600',
              textAlign: 'center',
            }}>
            Sign Message
          </Text>
          <Text
            style={{
              color: Theme['fg-200'],
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
                ? Theme['accent-090']
                : Theme['accent-100'],
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: Theme['gray-glass-020'],
              shadowColor: Theme['accent-100'],
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
                color: Theme['inverse-100'],
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
              color: Theme['accent-100'],
              fontSize: 24,
              fontWeight: '600',
              textAlign: 'center',
            }}>
            Connect
          </Text>
          <Text
            style={{
              color: Theme['fg-200'],
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
                ? Theme['accent-090']
                : Theme['accent-100'],
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: Theme['gray-glass-020'],
              shadowColor: Theme['accent-100'],
              shadowOffset: {
                width: 2,
                height: 4,
              },
              shadowOpacity: 0.5,
              shadowRadius: 3.84,
              elevation: 5,
            })}
            onPress={() => {}}>
            <WalletIcon width={18} height={18} fill={Theme['accent-100']} />
            <Text
              style={{
                color: Theme['inverse-100'],
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
