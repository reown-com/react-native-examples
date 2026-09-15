import { useEffect, useCallback, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';

import SettingsStore from '@/store/SettingsStore';
import WalletStore, { WalletAddresses } from '@/store/WalletStore';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { WalletConnectLoading } from '@/components/WalletConnectLoading';
import { Spacing } from '@/utils/ThemeUtil';
import { TokenBalance } from '@/utils/BalanceTypes';
import { TokenBalanceCard, ITEM_HEIGHT } from './components/TokenBalanceCard';
import { haptics } from '@/utils/haptics';
import type { WalletNamespace } from '@/utils/WalletInitializationUtil';

function getAddressForChain(
  chainId: string,
  addresses: WalletAddresses,
): string {
  if (chainId.startsWith('ton:')) {
    return addresses.tonAddress || '';
  }
  if (chainId.startsWith('tron:')) {
    return addresses.tronAddress || '';
  }
  if (chainId.startsWith('sui:')) {
    return addresses.suiAddress || '';
  }
  if (chainId.startsWith('solana:')) {
    return addresses.solanaAddress || '';
  }
  if (chainId.startsWith('bip122:')) {
    return addresses.bitcoinAddress || '';
  }
  if (chainId.startsWith('stellar:')) {
    return addresses.stellarAddress || '';
  }
  // Default to EIP155 address for all EVM chains
  return addresses.eip155Address || '';
}

function getWalletNamespaceForChain(chainId: string): WalletNamespace {
  const namespace = chainId.split(':', 1)[0];

  switch (namespace) {
    case 'sui':
    case 'ton':
    case 'tron':
    case 'canton':
    case 'solana':
    case 'bip122':
    case 'stellar':
      return namespace;
    default:
      return 'eip155';
  }
}

export default function Wallets() {
  const {
    eip155Address,
    tonAddress,
    tronAddress,
    suiAddress,
    solanaAddress,
    bitcoinAddress,
    stellarAddress,
    walletReadiness,
  } = useSnapshot(SettingsStore.state);
  const { balances, isLoading } = useSnapshot(WalletStore.state);
  const Theme = useTheme();

  const addresses: WalletAddresses = useMemo(
    () => ({
      eip155Address,
      tonAddress,
      tronAddress,
      suiAddress,
      solanaAddress,
      bitcoinAddress,
      stellarAddress,
    }),
    [
      eip155Address,
      tonAddress,
      tronAddress,
      suiAddress,
      solanaAddress,
      bitcoinAddress,
      stellarAddress,
    ],
  );

  const walletsRestored = Object.values(walletReadiness).every(
    readiness => readiness === 'ready' || readiness === 'failed',
  );

  const fetchBalances = useCallback(() => {
    if (
      walletsRestored &&
      (addresses.eip155Address ||
        addresses.tonAddress ||
        addresses.tronAddress ||
        addresses.suiAddress ||
        addresses.solanaAddress ||
        addresses.bitcoinAddress ||
        addresses.stellarAddress)
    ) {
      WalletStore.fetchBalances(addresses);
    }
  }, [addresses, walletsRestored]);

  const handleRefresh = useCallback(() => {
    haptics.pullToRefresh();
    fetchBalances();
  }, [fetchBalances]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const renderItem = useCallback(
    ({ item }: { item: TokenBalance }) => {
      const walletAddress = getAddressForChain(item.chainId, addresses);
      const readiness =
        walletReadiness[getWalletNamespaceForChain(item.chainId)];
      const walletAddressStatus =
        readiness === 'ready' && walletAddress
          ? 'ready'
          : readiness === 'failed'
          ? 'unavailable'
          : 'loading';

      return (
        <TokenBalanceCard
          balance={item}
          walletAddress={walletAddress}
          walletAddressStatus={walletAddressStatus}
        />
      );
    },
    [addresses, walletReadiness],
  );

  const keyExtractor = useCallback(
    (item: TokenBalance) => `${item.chainId}-${item.address || 'native'}`,
    [],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<TokenBalance> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: index * (ITEM_HEIGHT + Spacing[2]),
      index,
    }),
    [],
  );

  const ListEmptyComponent = useCallback(() => {
    if (!walletsRestored || isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <WalletConnectLoading size={60} />
          <Text variant="lg-400" color="text-primary">
            {walletsRestored
              ? 'Loading your balances…'
              : 'Preparing your wallets…'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="lg-400" color="text-primary" style={styles.emptyText}>
          No balances yet
        </Text>
      </View>
    );
  }, [isLoading, walletsRestored]);

  return (
    <FlatList
      data={balances}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListEmptyComponent={ListEmptyComponent}
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}
      contentContainerStyle={[
        styles.content,
        balances.length === 0 && styles.emptyContent,
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && balances.length > 0}
          onRefresh={handleRefresh}
          tintColor={Theme['text-primary']}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing[5],
    rowGap: Spacing[2],
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[10],
    gap: Spacing[4],
  },
  emptyText: {
    marginTop: Spacing[3],
  },
});
