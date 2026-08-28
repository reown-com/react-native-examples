import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { showToast } from '@/utils/ToastUtil';

import { setClipboardString } from '@/utils/ClipboardUtil';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import CopySvg from '@/assets/Copy';
import { TokenBalance } from '@/utils/BalanceTypes';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { haptics } from '@/utils/haptics';
import { Button } from '@/components/Button';
import { Shimmer } from '@/components/Shimmer';

export const ITEM_HEIGHT = 86;

interface TokenBalanceCardProps {
  balance: TokenBalance;
  walletAddress: string;
  walletAddressStatus: 'loading' | 'ready' | 'unavailable';
}

function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function formatBalance(numeric: string, symbol: string): string {
  const num = parseFloat(numeric);
  if (num === 0) return `0 ${symbol}`;
  if (num < 0.0001) return `<0.0001 ${symbol}`;
  if (num < 1) return `${num.toFixed(4)} ${symbol}`;
  if (num < 1000) return `${num.toFixed(2)} ${symbol}`;
  return `${num.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ${symbol}`;
}

export const TokenBalanceCard = React.memo(function TokenBalanceCard({
  balance,
  walletAddress,
  walletAddressStatus,
}: TokenBalanceCardProps) {
  const Theme = useTheme();
  const isAddressReady =
    walletAddressStatus === 'ready' && Boolean(walletAddress);

  // Get chain data and icon from PresetsUtil
  const chainData = PresetsUtil.getChainDataById(balance.chainId);
  const chainIcon = PresetsUtil.getChainIconById(balance.chainId);
  const chainName = chainData?.name || balance.name;

  const copyToClipboard = () => {
    if (!isAddressReady) return;

    setClipboardString(walletAddress);
    haptics.copyAddress();
    showToast({
      type: 'info',
      text1: `${chainName} address copied`,
    });
  };

  return (
    <Button
      onPress={copyToClipboard}
      disabled={!isAddressReady}
      accessibilityLabel={
        isAddressReady
          ? `Copy ${chainName} address`
          : walletAddressStatus === 'loading'
          ? `${chainName} address loading`
          : `${chainName} address unavailable`
      }
      style={[styles.card, { backgroundColor: Theme['foreground-primary'] }]}
    >
      <View style={styles.iconContainer}>
        {/* Token icon */}
        {balance.iconUrl ? (
          <Image
            source={{ uri: balance.iconUrl, cache: 'force-cache' }}
            style={[styles.tokenIcon, { backgroundColor: Theme['bg-invert'] }]}
            resizeMode="contain"
          />
        ) : chainIcon ? (
          <Image
            source={chainIcon}
            style={styles.tokenIcon}
            resizeMode="contain"
          />
        ) : (
          <View
            style={[
              styles.tokenIcon,
              styles.placeholderIcon,
              { backgroundColor: Theme['foreground-tertiary'] },
            ]}
          />
        )}
        {/* Chain badge */}
        {chainIcon && balance.iconUrl && (
          <View
            style={[
              styles.chainBadge,
              { backgroundColor: Theme['bg-primary'] },
            ]}
          >
            <Image
              source={chainIcon}
              style={styles.chainBadgeIcon}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text variant="lg-400" color="text-primary">
          {balance.balanceUnavailable
            ? `~ ${balance.symbol}`
            : formatBalance(balance.quantity.numeric, balance.symbol)}
        </Text>
        <View testID="wallet-address-slot" style={styles.addressSlot}>
          {walletAddressStatus === 'loading' ? (
            <Shimmer width={126} height={16} borderRadius={BorderRadius[1]} />
          ) : (
            <Text
              variant="lg-400"
              color="text-secondary"
              style={styles.addressText}
            >
              {isAddressReady
                ? truncateAddress(walletAddress)
                : 'Address unavailable'}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.copyButton}>
        <CopySvg
          width={20}
          height={20}
          fill={isAddressReady ? Theme['text-primary'] : Theme['icon-default']}
        />
      </View>
    </Button>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius[4],
    paddingHorizontal: Spacing[6],
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    marginRight: Spacing[3],
    position: 'relative',
  },
  tokenIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
  },
  placeholderIcon: {
    borderRadius: BorderRadius.full,
  },
  chainBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  chainBadgeIcon: {
    width: 14,
    height: 14,
    borderRadius: BorderRadius.full,
  },
  cardContent: {
    flex: 1,
    gap: Spacing['05'],
  },
  addressSlot: {
    height: 20,
    justifyContent: 'center',
  },
  addressText: {
    lineHeight: 20,
  },
  copyButton: {
    padding: Spacing[2],
  },
});
